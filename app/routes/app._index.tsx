import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { BlockStack, Button, Card, Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import ErrorBlock from "../components/errorBlock.js";
import { ChartVerticalFilledIcon } from "@shopify/polaris-icons";
import moment from "moment";
import { fetchShopQuery } from "../utils/shopData.js";
import { handleErrorResponse } from "../utils/errorHandler.js";
import { fetchProductsQuery } from "../utils/productUtils.js";
import { useShop } from "../utils/ShopContext.js";
import { countIssues, countProductsByShopID } from "../models/products.js";
import { categoryValuesSum } from "../models/issue.js";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { shops } from "@prisma/client";
import type { ErrorHandler } from "../utils/handleApiError";
import {IssueListCharts} from "../components/issue_list_charts";
import {InsightsSection} from "../components/insights_section";

interface Store {
  success: boolean;
  shop: shops;
  subscription: Array<any>;
  productNumber: number;
}

interface Issue {
  _count: {
    _all: number;
  };
  feedback_issues: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  let storeData: Store | ErrorHandler;
  let issues: Array<{ dataValue: number; dataTitle: string }> = [];
  let sumIssuesCatType: Array<any> = [];
  let countProductsInDB: number = 0;

  try {
    const fetchedData = await fetchShopQuery(admin);

    if (!fetchedData || !fetchedData?.success || !fetchedData?.shop) {
      throw new Error("No data returned from the GraphQL API.");
    }

    storeData = fetchedData as Store;
    countProductsInDB = await countProductsByShopID(storeData.shop.id);

    if (countProductsInDB > 0 && storeData.productNumber > 0 && !storeData.shop.needResync) {
      const [issuesSeverity, issuesCatSum] = await Promise.all([
        countIssues(storeData.shop.id),
        categoryValuesSum(storeData.shop.id),
      ]);

      if (issuesSeverity.success && Array.isArray(issuesSeverity.data)) {
        issues = issuesSeverity.data.map((issue) => ({
          dataValue: issue._count ?? 0,
          dataTitle: issue.feedback_issues ?? "Unknown",
        }));
      } else {
        console.warn("No issues data returned:", issuesSeverity.error);
      }

      sumIssuesCatType = issuesCatSum;
    }

    const { shop, subscription } = storeData;
    return {
      success: true,
      shop,
      subscription,
      issues,
      issuesCat: sumIssuesCatType,
    };
  } catch (error) {
    console.error("Loader Error:", error);
    return handleErrorResponse(error instanceof Error ? error.message : "Unknown error");
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);
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
  subscription: Array<any>;
  issues: Array<{ dataValue: number; dataTitle: string }>;
  issuesCat: Array<any>;
};

type ActionData = {
  success: boolean;
  count: number;
};

export default function Index() {
  const fetcher = useFetcher<ActionData>();
  const { success, shop, issues, issuesCat, subscription } = useLoaderData<LoaderData>();
  const { storeMainData } = useShop();

  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shop) {
      return;
    }

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
  }, [fetcher.data]);

  const onDismiss = () => {
    setIsVisible(false);
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
                  Use the "Analyze Product" button to evaluate your products for improvements.
                </Text>

                <Text as={"p"} variant={"bodyXs"}>
                  Last time analyze:{" "}
                  {shop?.last_sync ? moment(`${shop?.last_sync}`).fromNow() : "Never"}
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
