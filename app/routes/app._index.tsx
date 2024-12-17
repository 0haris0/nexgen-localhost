import { useShop } from "../utils/ShopContext";
// Converted to TypeScript
import React, { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  Layout,
  List,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";

import ErrorBlock from "../components/errorBlock.js";
import IssueListChart from "../components/issueListChart.js";
import { ChartVerticalFilledIcon } from "@shopify/polaris-icons";
import moment from "moment";
import { fetchShopQuery } from "../utils/shopData.js";
import { handleErrorResponse } from "../utils/errorHandler.js";
import { fetchProductsQuery } from "../utils/productUtils.js";
import { countIssues, countProductsByShopID } from "../models/products.js";
import { categoryValuesSum } from "../models/issue.js";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { shops } from "@prisma/client";
import type { ActiveSubscriptions } from "@shopify/shopify-api";
import type { Issue, Store } from "../globals";

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
      const issuesSeverity = await countIssues(storeData.shop.id);
      const issuesCatSum = await categoryValuesSum(storeData.shop.id);
      issues = [];
      if (issuesSeverity.success && Array.isArray(issuesSeverity.data)) {
        issues = issuesSeverity.data.map((issue) => ({
          dataValue: issue._count?._all ?? 0,
          dataTitle: issue.feedback_issues ?? "Unknown",
        }));
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

// Subcomponents
function IssueListCharts({
                           issues,
                           issuesCat,
                         }: {
  issues: Issue[];
  issuesCat: Issue[];
}) {
  return (
    <Card padding="600">
      <BlockStack gap="300" align="center">
        <Text as="span" variant={"headingMd"}>
          Analyze result
        </Text>
        <Card roundedAbove="lg" padding="600">
          <IssueListChart
            chartData={issues}
            gradient={true}
            title="Number of issues per product"
          />
        </Card>
        <Card>
          <IssueListChart
            chartData={issuesCat}
            title="Number of issues in shop"
          />
        </Card>
      </BlockStack>
    </Card>
  );
}

/*
function exportButton() {
  return (
    <>
      <Button
        onClick={() => {
          const file = this.fetcher.load("/export-csv");
        }}
      >
        Export CSV
      </Button>
      <Button
        onClick={() => {
          window.location.href = "/export-excel";
        }}
      >
        Export excel
      </Button>
      ;
    </>
  );
}
*/
function InsightsSection() {
  return (
    <BlockStack gap="200">
      <Card>
        <Text as="h2" variant="headingMd">
          Shop Performance Insights
        </Text>
        <List type="bullet">
          <List.Item>
            Average product view increased by <b>25%</b> with SEO improvements.
          </List.Item>
          <List.Item>
            Optimized descriptions led to a <b>20%</b> boost in conversion
            rates.
          </List.Item>
          <List.Item>
            Better categorization reduced bounce rates by <b>15%</b>.
          </List.Item>
          <List.Item>
            Inventory tracking reduced <b>out-of-stock</b> incidents, improving
            satisfaction.
          </List.Item>
        </List>
      </Card>
    </BlockStack>
  );
}

