// Helper function to update product details on Shopify and save to DB
import dbServer from "../db.server.js";
import { saveProduct } from "../models/products.js";
import { lastSync, shopId } from "../models/shop.js";
import { saveIssue } from "../models/issue.js";
import { handleApiError } from "./handleApiError";
import type { Product, ProductEdge } from "../types/admin.types";

async function updateProduct(admin: any, productData: any, actionType: any) {
  // GraphQL mutation for updating product details
  const mutation = `
    mutation updateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          descriptionHtml
          tags
          productType
          seo {
            title
            description
          }
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Variables for the mutation
  const variables = {
    input: {
      id: productData.shopify_id,
      title: productData.newTitle,
      descriptionHtml: productData.newDescription,
      seo: {
        title: productData.newSeoTitle,
        description: productData.newSeoDescription,
      },
      tags: productData.newTags,
      productType: productData.newProductType,
    },
  };

  try {
    // Send mutation request to Shopify
    let updatedProductData;
    if (actionType === "reject") {
      updatedProductData = {
        id: productData.id,
        shopify_id: productData.shopify_id,
        product_status: "processed",
        ai_correction: false,
      };
      const updatedProduct = await dbServer.product.update({
        where: {
          id: productData.id,
          shopify_id: productData.shopify_id,
        },
        data: updatedProductData,
      });

      return {
        success: true,
        updatedProduct: updatedProduct,
        actionType: actionType,
      };
    }
    const response = await admin.graphql(mutation, { variables: variables });
    const result = await response.json();

    if (result.data.productUpdate.userErrors.length > 0) {
      console.error("User Errors:", result.data.productUpdate.userErrors);
      throw new Error("Failed to update product: User errors encountered.");
    }

    // Extract updated product data from response
    const newProduct = result.data.productUpdate.product;

    // Prepare data for database update
    updatedProductData = {
      title: newProduct.title,
      description: newProduct.descriptionHtml,
      seo_title: newProduct.seo.title,
      seo_description: newProduct.seo.description,
      tags: newProduct.tags,
      product_type: newProduct.productType,
      featured_image: {
        url: newProduct.images.edges[0]?.node.src || null,
      },
      last_checked: new Date(),
      product_status: "updated",
      ai_correction: false,
      feedback: productData.feedback,
      feedback_issues: productData.feedback_issues,
      category_name: productData.newCategoryName,
      handle: productData.handle,
    };
    try {
      // Update the product in the database
      const updatedProduct = await dbServer.product.update({
        where: {
          id: productData.id,
          shopify_id: productData.shopify_id,
        },
        data: updatedProductData,
      });

      return {
        success: true,
        result,
        updatedProduct,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating product in DB:", error);
        return handleApiError(error, error.message);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating product:", error);
      return handleApiError(error, error.message);
    }
  }
}

export default updateProduct;

type issueCount = {
  seoTitle: 0;
  seoDescription: 0;
  featuredMedia: 0;
  title: 0;
  variants: 0;
  publishedAt: 0;
  tags: 0;
  collections: 0;
  productType: 0;
  vendor: 0;
  tracksInventory: 0;
};
type feedback = {
  issue: string;
  severity: string;
  message: string;
};

type analyzedProduct = {
  success: boolean;
  feedbacks: Array<feedback>;
  issuesCount: issueCount;
  error?: string;
};
export const analyzeProductFromShopify = (
  singleProduct: Product,
): analyzedProduct => {
  let feedbackList = [];
  let issueCount: issueCount = {
    seoTitle: 0,
    seoDescription: 0,
    featuredMedia: 0,
    title: 0,
    variants: 0,
    publishedAt: 0,
    tags: 0,
    collections: 0,
    productType: 0,
    vendor: 0,
    tracksInventory: 0,
  };
  try {
    if (!singleProduct.seo?.title || singleProduct.seo.title.trim() === "") {
      issueCount.seoTitle += 1;
      feedbackList.push({
        issue: "SEO Title",
        severity: "high",
        message: "SEO title is missing.",
      });
    }

    if (
      !singleProduct.seo?.description ||
      singleProduct.seo.description.trim() === ""
    ) {
      issueCount.seoDescription += 1;
      feedbackList.push({
        issue: "SEO Description",
        severity: "medium",
        message: "SEO description is missing.",
      });
    }

    if (
      !singleProduct.featuredMedia ||
      !singleProduct.featuredMedia.preview?.image?.url
    ) {
      issueCount.featuredMedia += 1;
      feedbackList.push({
        issue: "Media",
        severity: "high",
        message: "Product has no featured media.",
      });
    }

    if (!singleProduct.title || singleProduct.title.trim() === "") {
      issueCount.title += 1;
      feedbackList.push({
        issue: "Title",
        severity: "high",
        message: "Product title is missing.",
      });
    }

    if (
      !singleProduct.descriptionHtml ||
      singleProduct.descriptionHtml.trim().length < 50
    ) {
      feedbackList.push({
        issue: "Description",
        severity: "medium",
        message: "Product description is missing or too short.",
      });
    }

    if (
      !singleProduct.variants?.edges ||
      singleProduct.variants.edges.length === 0
    ) {
      issueCount.variants += 1;
      feedbackList.push({
        issue: "Variants",
        severity: "high",
        message: "Product has no variants.",
      });
    }

    if (!singleProduct.publishedAt) {
      issueCount.publishedAt += 1;
      feedbackList.push({
        issue: "Publication",
        severity: "medium",
        message: "Product is not published on any sales channels.",
      });
    }

    const priceMissing = singleProduct.variants?.edges.some(
      (variant) => !variant.node?.price || parseFloat(variant.node.price) === 0,
    );
    if (priceMissing) {
      feedbackList.push({
        issue: "Price",
        severity: "high",
        message: "Product price is missing or set to zero.",
      });
    }

    if (!singleProduct.tags || singleProduct.tags.length === 0) {
      issueCount.tags += 1;
      feedbackList.push({
        issue: "Tags",
        severity: "low",
        message: "Product has no tags.",
      });
    }

    if (
      !singleProduct.collections?.edges ||
      singleProduct.collections.edges.length === 0
    ) {
      issueCount.collections += 1;
      feedbackList.push({
        issue: "Collections",
        severity: "low",
        message: "Product is not part of any collection.",
      });
    }

    if (!singleProduct.productType || singleProduct.productType.trim() === "") {
      issueCount.productType += 1;
      feedbackList.push({
        issue: "Product Type",
        severity: "medium",
        message: "Product type is missing.",
      });
    }

    if (!singleProduct.vendor || singleProduct.vendor.trim() === "") {
      issueCount.vendor += 1;
      feedbackList.push({
        issue: "Vendor",
        severity: "medium",
        message: "Product vendor is missing.",
      });
    }

    if (!singleProduct.tracksInventory) {
      issueCount.tracksInventory += 1;
      feedbackList.push({
        issue: "Inventory Tracking",
        severity: "medium",
        message: "Product inventory is not being tracked.",
      });
    }

    if (
      !singleProduct.status ||
      !["ACTIVE", "ARCHIVED", "DRAFT"].includes(singleProduct.status)
    ) {
      feedbackList.push({
        issue: "Status",
        severity: "high",
        message: "Product status is invalid.",
      });
    }

    return {
      success: true,
      feedbacks: feedbackList,
      issuesCount: issueCount,
    };
  } catch (error) {
    console.error("Error analyzing product:", error);
    return {
      success: false,
      error: "Product analyzed finished unsuccessfully",
      feedbacks: feedbackList || [],
      issuesCount: issueCount || 0,
    };
  }
};
export const fetchProductsQuery = async (admin: any) => {
  try {
    // Fetch products using Shopify GraphQL
    const response = await admin.graphql(
      `#graphql
      query getProducts {
        shop { id name }
        products(first: 250, query: "status:ACTIVE") {
          edges {
            node {
              id handle title description
              category { id fullName name }
              tags productType
              featuredMedia { mediaContentType alt preview { image { url width height } } }
              seo { title description }
              status updatedAt createdAt
            }
          }
          pageInfo { hasNextPage hasPreviousPage }
        }
        productsCount(query: "status:ACTIVE") { count }
      }
      `,
    );
    const result = await response.json();

    if (!result || result.errors) {
      console.error("GraphQL Errors:", result.errors);
      throw new Error("GraphQL query failed.");
    }

    if (!result.data) {
      throw new Error("GraphQL response is empty.");
    }
    const productEdges = result.data.products.edges as Array<ProductEdge>;
    const shopifyId = result.data.shop.id;
    const shopIdVal = await shopId(shopifyId);

    for (const { node: product } of productEdges) {
      const { feedbacks: feedback, issuesCount: issueCount } =
        analyzeProductFromShopify(product);
      // Save the analyzed product data
      const newProduct = await saveProduct({
        shopify_id: product.id,
        shop_id: shopIdVal,
        title: product.title,
        description: product.description,
        feedback,
        feedback_issues: feedback.length,
        last_checked: new Date(product.updatedAt),
        handle: product.handle,
        category_id: product.category?.id,
        category_name: product.category?.name,
        tags: product.tags,
        product_type: product.productType,
        featured_image: {
          url: product.featuredMedia?.preview?.image?.url,
        },
        seo_title: product.seo?.title,
        seo_description: product.seo?.description,
        date_created: new Date(product.createdAt),
      });

      // Save product issues in the database
      await saveIssue(shopIdVal, issueCount, newProduct.id, product.id);

      // Update last sync time for this product
      await lastSync(shopIdVal, shopifyId);
    }
    return {
      success: true,
      productsCount: result.data.productsCount.count,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return handleApiError(error, error.message);
    } else {
      return {
        success: false,
        error: "An unexpected error occurred while fetching products.",
      };
    }
  }
};
