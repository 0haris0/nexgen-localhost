// Converted to TypeScript
import {useEffect, useState} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {BlockStack, Button, Card, Layout, List, Page, Text} from '@shopify/polaris';
import {authenticate} from '../shopify.server.js';
import ProgressBlock from '../components/progressBlock.js';
import ErrorBlock from '../components/errorBlock.js';
import IssueListChart from '../components/issueListChart.js';
import {ChartVerticalFilledIcon} from '@shopify/polaris-icons';
import moment from 'moment';
import {fetchShopQuery} from '../utils/shopData.js';
import {handleErrorResponse} from '../utils/errorHandler.js';
import {fetchProductsQuery} from '../utils/productUtils.js';
import {useShop} from '../utils/ShopContext.js';
import {countIssues, countProductsByShopID} from '../models/products.js';
import {categoryValuesSum} from '../models/issue.js';
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import type {shops} from "@prisma/client";
import type {ErrorHandler} from '../utils/handleApiError'

type Store = { success: boolean, shop: shops, subscription: Array<any>, productNumber: number }

// Loader Function
export const loader = async ({request}: LoaderFunctionArgs) => {
    const {admin} = await authenticate.admin(request);
    let storeData: Store | ErrorHandler;
    let issues: Array<any> = [],
      sumIssuesCatType: Array<any> = [];
    let countProductsInDB: number;
    try {
      storeData = await fetchShopQuery(admin);
      console.log(storeData);
      if (!storeData) {
        new Error('No data returned from the GraphQL API.');
      }
      countProductsInDB = await countProductsByShopID(storeData.shop.id);
      console.log(countProductsInDB, 'indb');
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        return handleErrorResponse(err.message);
      }
    }
    try {

      if (countProductsInDB > 0 && storeData.productNumber > 0 &&
        storeData.shop.needResync === false) {
        const issuesSeverity = await countIssues(storeData.shop.id);
        const issuesCatSum = await categoryValuesSum(storeData.shop.id);

        issues = issuesSeverity.map((issue) => ({
          dataValue: issue._count._all,
          dataTitle: issue.feedback_issues,
        }));

        sumIssuesCatType = issuesCatSum;
      }

    } catch (error) {
      console.error('Loader Error:', error);
      // Ensure handleErrorResponse returns an object matching the loader's return structure
      return handleErrorResponse(error.message);
    }
    const {
      shop,
      subscription,
    } = storeData;
    return {
      success: true,
      shop,
      subscription,
      issues,
      issuesCat: sumIssuesCatType,
    };
  }
;

// Action Function
export const action = async ({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);

  try {
    const productsData = await fetchProductsQuery(admin).then((response) => response).then((data) => data).catch((error) => {
      console.error(error.message);
      return handleErrorResponse(error.message);
    });

    return {
      success: true,
      count: productsData.productsCount,
    };
  } catch (error) {
    console.error('Action Error:', error);
    return handleErrorResponse(error.message);
  }
};

// Main Component
export function Index() {
  const fetcher = useFetcher();
  const {
    success,
    shop,
    issues,
    issuesCat,
    subscription,
  } = useLoaderData();

  const [totalProduct, setTotalProducts] = useState(0);
  const [finishedProduct, setFinishedProduct] = useState(0);
  const [progressBarVisible, setProgressBarVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    storeData,
    setStoreData,
    subscriptionData,
    setSubscriptionData,
    savedStoreData,
    setSavedStoreData,
  } = useShop();

  useEffect(() => {
    if (!shop) {
      return;
    }
    setStoreData({
      id: shop.id,
      shopify_id: shop.shopify_shop_id,
      name: shop.shop_name,
    });
    if (subscription.length === 0) {
      return;
    }
    /*setSubscriptionData({
      name: subscription[0].name,
      credit: shop.credit,
      valid: subscription[0].currentPeriodEnd,
      active: true,
    });*/
    console.table(storeData);
    console.table(subscriptionData);
  }, [success]);

  useEffect(() => {
    if (fetcher.state === 'loading' || fetcher.state === 'submitting') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.data?.count) {
      setTotalProducts(fetcher.data.count);
    }
    if (fetcher.data?.success === false) {
      setIsVisible(true);
      setError({
        title: fetcher.data.title,
        message: fetcher.data.message,
      });
    }
  }, [fetcher]);

  const onDismiss = () => {
    setIsVisible(false);
    setError(null);
  };
  return (
    <Page title="Analytics for your products">
      <BlockStack gap="300">
        <ErrorBlock error={error} isVisible={isVisible}
                    onDismiss={onDismiss}/>
        <Layout>
          {progressBarVisible && (
            <ProgressBlock
              isVisible={progressBarVisible}
              toggleProgress={() => setProgressBarVisible(
                !progressBarVisible)}
              totalProducts={totalProduct}
              finishedProducts={finishedProduct}
            />
          )}
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h3" variant="headingMd">
                  Analyze Product
                </Text>
                <Text variant="bodyMd">
                  Use the "Analyze Product" button to evaluate your products
                  for
                  improvements.
                </Text>
                {progressBarVisible ? null : (
                  <Text variant={'bodyXs'} tone={''}>
                    Last time analyze:{' '}
                    {shop?.last_sync
                      ? moment(`${shop?.last_sync}`).fromNow()
                      : 'Never'}
                  </Text>
                )}
                <Button
                  loading={isLoading || progressBarVisible}
                  size={'medium'}
                  fullWidth={false}
                  variant={'secondary'}
                  icon={ChartVerticalFilledIcon}
                  onClick={() => {
                    setProgressBarVisible(true);
                    fetcher.submit({}, {method: 'POST'});
                  }}
                >
                  Analyze Product
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {issues && issues.length > 0 && issuesCat ? (
            <Layout.Section>
              <IssueListCharts issues={issues} issuesCat={issuesCat}/>
            </Layout.Section>
          ) : null}

          <Layout.Section variant="oneThird">
            <BlockStack gap="200">
              <InsightsSection/>
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
                         }) {
  return (
    <Card padding="600">
      <BlockStack gap="300" align="center">
        <Text variant={'headingMd'}>Analyze result</Text>
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

function exportButton() {
  return (
    <>
      <Button
        onClick={() => {
          const file = this.fetcher.load('/export-csv');
        }}
      >
        Export CSV
      </Button>
      <Button
        onClick={() => {
          window.location.href = '/export-excel';
        }}
      >
        Export excel
      </Button>
      ;
    </>
  );
}

function InsightsSection() {
  return (
    <BlockStack gap="200">
      <Card>
        <Text as="h2" variant="headingMd">
          Shop Performance Insights
        </Text>
        <List type="bullet">
          <List.Item>
            Average product view increased by <b>25%</b> with SEO
            improvements.
          </List.Item>
          <List.Item>
            Optimized descriptions led to a <b>20%</b> boost in conversion
            rates.
          </List.Item>
          <List.Item>
            Better categorization reduced bounce rates by <b>15%</b>.
          </List.Item>
          <List.Item>
            Inventory tracking reduced <b>out-of-stock</b> incidents,
            improving
            satisfaction.
          </List.Item>
        </List>
      </Card>
    </BlockStack>
  );
}
