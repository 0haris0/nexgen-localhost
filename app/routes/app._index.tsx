// Organize imports by type
// 1. React and framework imports
import React, { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

// 2. Third-party imports
import { BlockStack, Button, Card, Layout, Page, Text } from "@shopify/polaris";
import { ChartVerticalFilledIcon } from "@shopify/polaris-icons";
import moment from "moment";
import type { shops } from "@prisma/client";
import type { ActiveSubscriptions } from "@shopify/shopify-api";

// 3. Local imports
import { useShop } from "../utils/ShopContext";
import { authenticate } from "../shopify.server";
import { fetchShopQuery } from "../utils/shopData";
import { handleErrorResponse } from "../utils/errorHandler";
import { fetchProductsQuery } from "../utils/productUtils";
import { countIssues, countProductsByShopID } from "../models/products";
import { categoryValuesSum } from "../models/issue";
import type { Issue, Store } from "../globals";
import { InsightsSection } from "../components/insights_section";
import { IssueListCharts } from "../components/issue_list_charts";
import ErrorBlock from "../components/errorBlock";


// Loader Function
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  let storeData: Store = {
    productNumber: 0,
    shop: {} as shops,
    subscription: {} as ActiveSubscriptions,
    success: false,
  };
  let issues: Array<any> = [],
    sumIssuesCatType: Array<any> = [];
  let countProductsInDB = 0;
  try {
    const fetchedData = await fetchShopQuery(admin);

    if (!fetchedData || !fetchedData?.success || !fetchedData?.shop) {
      new Error("No data returned from the GraphQL API.");
    }
    storeData = fetchedData as Store;
    countProductsInDB = await countProductsByShopID(storeData.shop.id);
    //console.log(countProductsInDB, "indb");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return handleErrorResponse(err.message);
    }
  }

  try {
    if (
      countProductsInDB > 0 &&
      storeData.productNumber > 0 &&
      !storeData.shop.needResync
    ) {
      //analiza
      const issuesSeverity = await countIssues(storeData.shop.id);
      console.log(issuesSeverity, "issuesSeverity");
      const issuesCatSum = await categoryValuesSum(storeData.shop.id);
      console.log(issuesCatSum, "issuesCatSum");
      issues = [];
      //spremanje
      if (issuesSeverity.success && Array.isArray(issuesSeverity.data)) {
        issues = issuesSeverity.data.map((issue) => ({
          dataValue: issue._count ?? 0,
          dataTitle: issue.feedback_issues ?? "Unknown",
        }));
        console.log(issues, "issues");
      } else {
        console.warn("No issues data returned:", issuesSeverity.error);
        issues = [];
      }

      sumIssuesCatType = issuesCatSum;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return handleErrorResponse(error.message);
    } else {
      return {
        success: false,
        error: "An error occurred while fetching issues",
      };
    }
  }
  const { shop, subscription } = storeData;
  return {
    success: true,
    shop,
    subscription,
    issues,
    issuesCat: sumIssuesCatType,
  };
};

// Action Function
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  try {
    // Fetch products data
    const productsData = await fetchProductsQuery(admin);

    if (!productsData) {
      throw new Error("Invalid products data returned.");
    }

    return {
      success: true,
      count: productsData.productsCount,
    };
  } catch (error) {
    console.error("Action Error:", error);

    return handleErrorResponse(
      error instanceof Error ? error.message : "An unknown error occurred.",
    );
  }
};

type LoaderData = {
  success: boolean;
  shop: shops | undefined;
  subscription: ActiveSubscriptions | [];
  issues: Array<Issue>;
  issuesCat: Array<Issue>;
};

type ActionData = {
  success: boolean;
  count: number;
};

// Main Component
export default function Index() {
  const fetcher = useFetcher<ActionData>();
  const { success, shop, issues, issuesCat, subscription } =
    useLoaderData<LoaderData>();
  const { storeMainData } = useShop(); // Correctly use the imported hook

  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /*const {
    storeData,
    setStoreData,
    subscriptionData,
    setSubscriptionData,
    savedStoreData,
    setSavedStoreData,
  } = useShop();*/
  console.log(storeMainData, "storeMainData");
  useEffect(() => {
    if (!shop) {
      return;
    }
    /*setStoreData({
      id: shop.id,
      shopify_id: shop.shopify_shop_id,
      name: shop.shop_name,
    });*/
    if (!subscription) {
      return;
    }
  }, [success]);

  useEffect(() => {
    if (fetcher.state === "loading" || fetcher.state === "submitting") {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.data?.success === false) {
      setIsVisible(true);
    }
  }, [fetcher]);

  const onDismiss = () => {
    setIsVisible(false);
    setError(null);
  };

  return (
    <Page title="Analytics for your products">
      <BlockStack gap="300">
        <ErrorBlock error={error} isVisible={isVisible} onDismiss={onDismiss} />
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h3" variant="headingMd">
                  Analyze Product
                </Text>
                <Text as={"p"} variant="bodyMd">
                  Use the "Analyze Product" button to evaluate your products for
                  improvements.
                </Text>

                <Text as={"p"} variant={"bodyXs"}>
                  Last time analyze:{" "}
                  {shop?.last_sync
                    ? moment(`${shop?.last_sync}`).fromNow()
                    : "Never"}
                </Text>
                <Button
                  loading={isLoading}
                  size={"medium"}
                  fullWidth={false}
                  variant={"secondary"}
                  icon={ChartVerticalFilledIcon}
                  onClick={() => {
                    fetcher.submit({}, { method: "POST" });
                  }}
                >
                  Analyze Product
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {issues && issues.length > 0 && issuesCat ? (
            <Layout.Section>
              <IssueListCharts issues={issues} issuesCat={issuesCat} />
            </Layout.Section>
          ) : null}

          <Layout.Section variant="oneThird">
            <BlockStack gap="200">
              <InsightsSection />
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
