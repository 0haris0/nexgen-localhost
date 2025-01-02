// Converted to TypeScript
import React, { useEffect, useReducer, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Divider,
  EmptyState,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Text,
  Tooltip,
} from "@shopify/polaris";
import {
  CheckSmallIcon,
  RefreshIcon,
  XSmallIcon,
} from "@shopify/polaris-icons";

import { Enhancement } from "../components/enhancement.js";
import {
  fetchEnhancedProducts,
  getSingleProductFromHistory,
  saveProductHistory,
  updateAiCorrection,
  updateStatus,
} from "../models/products.js";
import { authenticate } from "../shopify.server.js";
import { updateCredit } from "../models/shop.js";
import updateProduct from "../utils/productUtils.js";
import { fetchShopQuery } from "../utils/shopData.js";
import { handleErrorResponse } from "../utils/errorHandler.js";
import { generateProductData } from "../models/ai.js";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { product } from "@prisma/client";

interface ProductState {
  products: product[];
}

interface Action {
  type: string;
  payload: product | product[];
}

// Define action types
const ACTIONS = {
  SET_PRODUCTS: "set_products",
  ENHANCE_PRODUCT: "enhance_product",
  APPROVE_PRODUCT: "approve_product",
  REJECT_PRODUCT: "reject_product",
};

// Reducer function
function productReducer(state: ProductState, action: Action) {
  switch (action.type) {
    case ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload as product[],
      };
    case ACTIONS.ENHANCE_PRODUCT:
      return {
        ...state,
        products: state.products.map((singleProduct) =>
          singleProduct.id === (action.payload as product).id
            ? (action.payload as product)
            : singleProduct,
        ),
      };
    case ACTIONS.APPROVE_PRODUCT:
      return {
        ...state,
        products: state.products.map((singleProduct) =>
          singleProduct.id === (action.payload as product).id
            ? { ...singleProduct, approved: true }
            : singleProduct,
        ),
      };
    case ACTIONS.REJECT_PRODUCT:
      return {
        ...state,
        products: state.products.filter(
          (singleProduct) =>
            singleProduct.id !== (action.payload as product).id,
        ),
      };
    default:
      return state;
  }
}

const initialState: ProductState = { products: [] };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  try {
    const response = await fetchShopQuery(admin);

    if (!response) {
      new Error("No data returned from the GraphQL API.");
    }

    const { shop, subscription } = response;
    console.log(response, "response");
    if (!shop) {
      throw new Error("No shop data found in the response.");
    }
    const enhancedProducts = await fetchEnhancedProducts(shop.id, true);
    console.log(enhancedProducts, "enhancedProducts");
    // Check each product's enhanced data in the database
    const productsWithEnhancements = await Promise.all(
      enhancedProducts.map(async (product) => {
        const enhancedData = await getSingleProductFromHistory(product.id);
        return enhancedData ? { ...product, ...enhancedData } : product;
      }),
    );
    console.log(productsWithEnhancements, "prodenh");
    return {
      success: true,
      data: productsWithEnhancements,
      shop: shop || {},
      subscription: subscription || {},
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return handleErrorResponse(error.message);
    } else {
      return {
        success: false,
        error: "An error occurred while fetching issues and products",
      };
    }
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const productData = formData.get("product");
  const shopData = formData.get("shop");

  const product = JSON.parse(productData as string);
  const shop = JSON.parse(shopData as string);
  try {
    if (!productData) {
      throw new Error("No product data found in form submission.");
    }
    //console.log(actionType);
    if (actionType === "enhance") {
      // Call the saveProductHistory function to store it in the database
      const isSaved = await saveProductHistory(product);
      const status = await updateStatus(product.id);
      if (!status) {
        throw new Error("Error updating status");
      }
      let amount = shop.credit - 100;
      const removeCredit = await updateCredit(shop.shopify_shop_id, amount);

      return {
        success: true,
        saved: isSaved,
        credit: removeCredit,
      };
    } else if (actionType === "approve" || actionType === "reject") {
      const isApproved = await updateProduct(admin, product, actionType);
      //console.log(isApproved, product, "noovoooo");
      await updateAiCorrection([product.id], false);
      return {
        success: true,
        isApproved: isApproved,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return handleErrorResponse(error.message);
    } else {
      return {
        success: false,
        error: "An error occurred while processing the action",
      };
    }
  }
};

type LoaderData = {
  data: Array<product>;
  shop: any;
  subscription: any;
};

export default function ReviewEnhancements() {
  const { data, shop, subscription } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const [state, dispatch] = useReducer(productReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [enhanceButtonLoading, setEnhanceButtonLoading] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [approveButtonLoading, setApproveButtonLoading] = useState(false);

  useEffect(() => {
    // Initialize state only once with loader data
    dispatch({
      type: ACTIONS.SET_PRODUCTS,
      payload: data,
    });
  }, [data]);

  useEffect(() => {
    async function checkAndImprove() {
      if (fetcher.state === "idle" && data && state.products) {
        /*const productsNeedingEnhancement = state.products.filter(
          (product: productHistory) =>
            !product.newTitle ||
            !product.newDescription ||
            !product.newTags ||
            !product.newSeoTitle ||
            !product.newCategoryName ||
            !product.newProductType ||
            !product.newSeoDescription,
        );*/
        setApproveButtonLoading(false);
      }
    }

    checkAndImprove();
  }, [data, fetcher.state, state.products]);

  /*const handleProducts = async (products: Product) => {
    for (const product of products) {
      await enhanceProductWithAI(product);
    }
  };*/

  const enhanceProductWithAI = async (singleProduct: product) => {
    let enhancedProduct = singleProduct;
    setEnhanceButtonLoading(true);

    if (shop.credit < 100) {
      shopify.toast.show("You don't have enough credit for this action");
      setEnhanceButtonLoading(false);
      return;
    }
    const cleanedJsonString = await generateProductData(singleProduct);
    try {
      const parsedEnhancedData = JSON.parse(cleanedJsonString);
      enhancedProduct = { ...enhancedProduct, ...parsedEnhancedData };

      // Directly update the UI state without waiting for server response
      dispatch({
        type: ACTIONS.ENHANCE_PRODUCT,
        payload: enhancedProduct,
      });
      // Optionally save enhanced product to the server without affecting UI state
      const formData = new FormData();
      formData.append("product", JSON.stringify(enhancedProduct));
      formData.append("shop", JSON.stringify(shop));
      formData.append("actionType", "enhance");
      fetcher.submit(formData, { method: "post" });
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    setIsEnhanced(true);
    setEnhanceButtonLoading(false);
  };

  const handleApprove = (product: product) => {
    setApproveButtonLoading(true);
    dispatch({
      type: ACTIONS.APPROVE_PRODUCT,
      payload: product,
    });
    const formData = new FormData();
    formData.append("product", JSON.stringify(product));
    formData.append("actionType", "approve");
    fetcher.submit(formData, { method: "post" });
  };

  const handleReject = (singleProduct: product) => {
    if (!singleProduct?.id) {
      console.error("Invalid product data for rejection");
      return;
    }
    const formData = new FormData();
    formData.append("product", JSON.stringify(singleProduct));
    formData.append("actionType", "reject");
    fetcher.submit(formData, { method: "post" });
    dispatch({
      type: ACTIONS.REJECT_PRODUCT,
      payload: singleProduct,
    });
  };

  return (
    <Page title="Review AI Enhancements" fullWidth>
      <Layout>
        {state.products.length > 0 ? (
          state.products.map((singleProduct: product) => (
            <Layout.Section key={singleProduct.id} variant={"fullWidth"}>
              <Card>
                <BlockStack gap="150">
                  <Text as={"p"} variant="headingMd">
                    {singleProduct.title}
                  </Text>

                  <Enhancement key={singleProduct.id} product={singleProduct} />

                  <Divider borderWidth="025" borderColor={"border-brand"} />
                  <InlineStack align={"space-between"}>
                    <ButtonGroup>
                      <Tooltip
                        content={
                          shop.credit < 100
                            ? "Need a credit for this action"
                            : ""
                        }
                        active={shop?.credit < 100}
                      >
                        <Button
                          disabled={shop?.credit < 100}
                          size={!isEnhanced ? "large" : "medium"}
                          loading={enhanceButtonLoading}
                          onClick={async () => {
                            await enhanceProductWithAI(singleProduct);
                          }}
                          icon={RefreshIcon}
                        >
                          Enhance with AI
                        </Button>
                      </Tooltip>

                      <Button
                        onClick={() => handleReject(singleProduct)}
                        icon={XSmallIcon}
                        variant={"secondary"}
                        tone={"critical"}
                        disabled={
                          !isEnhanced &&
                          singleProduct.product_status !== "processed"
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(singleProduct)}
                        loading={approveButtonLoading}
                        icon={CheckSmallIcon}
                        variant={"primary"}
                        disabled={
                          !isEnhanced &&
                          singleProduct.product_status !== "processed"
                        }
                      >
                        Approve
                      </Button>
                    </ButtonGroup>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))
        ) : (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="Manage your product AI Enhancement"
                action={{
                  content: "Select products",
                  url: "../products/",
                }}
                secondaryAction={{
                  content: "Analyze your store",
                  url: "../",
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Analyze store, select products and improve it with AI.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        )}
        {loading ? (
          <Layout.Section>
            <Spinner size={"large"} />
          </Layout.Section>
        ) : null}
      </Layout>
    </Page>
  );
}

async function regenerateAllEnhancements() {
  return [];
}
