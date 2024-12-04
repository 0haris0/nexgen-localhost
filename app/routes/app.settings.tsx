// Converted to TypeScript
// src/pages/AppSettings.jsx
import React, {useEffect, useState} from 'react';
import {Badge, Box, Card, FormLayout, Frame, IndexTable, Layout, Page, Text, TextField, Toast} from '@shopify/polaris';
import {authenticate} from '../shopify.server.js';
import {Link, useLoaderData} from '@remix-run/react';
import {getCredit, updateCredit} from '../models/shop.js';
import {getPlan} from '../models/plans.js';
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";


const GET_SUBSCRIPTION_BY_ID = `#graphql
    query getSubscription($idS: ID!) {
      node(id: $idS) {
        ... on AppSubscription {
          id
          name
          status
          createdAt
          test
          trialDays
          currentPeriodEnd
          lineItems {
            id
            plan {
              pricingDetails {
                __typename
                ... on AppRecurringPricing {
                  interval
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }`;
export const loader = async ({request}: LoaderFunctionArgs) => {
  const {
    admin,
    shop,
    billing,
  } = await authenticate.admin(request);
  const responseShop = await admin.graphql(`
    #graphql
    query {
      shop{
        id
        name
        primaryDomain {
          id
          host
          url
        }
        myshopifyDomain
        url
        unitSystem
        currencyCode
        contactEmail
        name
        description
        plan{
          displayName
        }
        billingAddress{address1,city,country,phone, zip,formatted}
      }
      productsCount{
        count
      }
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          test
          status
          createdAt
          trialDays
          currentPeriodEnd
        }
      }

    }
  `);
  const responseShopJson = await responseShop.json();
  let res,
    planData,
    subscriptionData,
    dataPayment;

  if (!responseShopJson.data) {
    return {
      success: false,
      error: 'Error fetching shop data',
    };
  }
  let shopIdVal = await responseShopJson.data?.shop;

  const url = new URL(request.url);
  const chargeId = url.searchParams.get('charge_id'); // replace with your actual charge ID

  if (chargeId) {
    try {
      const responseSubscription = await admin.graphql(
        GET_SUBSCRIPTION_BY_ID,
        {variables: {idS: `gid://shopify/AppSubscription/${chargeId}`}}, // formatted GID directly,
      );
      subscriptionData = await responseSubscription.json();
    } catch (error) {
      console.error(error.message);
      return {
        success: false,
        error: error.message,
      };
    }
    let planData2 = await getPlan(subscriptionData.data.node.name);
    dataPayment = await updateCredit(shopIdVal.id, planData2.credits);
  }
  let productCount = responseShopJson.data?.productsCount.count;
  let subscriptionName =
    responseShopJson.data?.currentAppInstallation?.activeSubscriptions[0]?.name;
  let credits;
  try {
    credits = await getCredit(shopIdVal.id);
    console.log(credits, 'credits');
  } catch (error) {
    console.error(error.message);
    return {
      success: false,
      error: error.message,
    };
  }
  shopIdVal.credits = credits || 0;
  return {
    shop: shopIdVal,
    subscription:
    responseShopJson.data?.currentAppInstallation.activeSubscriptions,
    planDataFull: dataPayment,
    subscriptionData: subscriptionData?.data.node,
  };
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  return null;
};

const AppSettings = () => {
  const [shopName, setShopName] = useState('');
  const [planType, setPlanType] = useState('basic');
  const [showToast, setShowToast] = useState(false);

  const data = useLoaderData();

  useEffect(() => {
    if (data.shop?.name) {
      setShopName(data.shop?.name);

    }
  }, [data]);

  const handleSave = () => {
    // Here you would handle saving the settings, such as updating them in your database
    setShowToast(true);
  };

  return (
    <Frame>
      <Page title="Application Settings">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Text variant="headingMd">Subscription information</Text>
              <Box padding="200">
                <FormLayout>
                  <TextField
                    label="Shop Name"
                    value={data?.shop?.name || ''}
                    onChange={setShopName}
                    disabled={true}
                    autoComplete="off"
                  />
                  <TextField
                    label={'Current subscription'}
                    autoComplete="off"
                    disabled={true}
                    value={data.subscription[0]?.name}
                  />
                  <TextField
                    label={'Credit amount'}
                    autoComplete="off"
                    disabled={true}
                    value={data.shop?.credits}
                  />
                  <Link
                    to={`https://${data.shop?.myshopifyDomain}/admin/charges/nexgen/pricing_plans/`}
                    target={'_blank'}
                  >
                    Change subscription
                  </Link>
                </FormLayout>
              </Box>

            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card sectioned>
              <Text variant={'headingMd'}>Pricing information</Text>
              <IndexTable headings={['Pricing']} itemCount={4}
                          selectable={false}>
                <IndexTable.Row id={'heading'}>
                  <IndexTable.Cell as={'th'}>Title</IndexTable.Cell>
                  <IndexTable.Cell as={'th'}>Description</IndexTable.Cell>
                  <IndexTable.Cell as={'th'}>
                    Amount
                  </IndexTable.Cell>
                </IndexTable.Row>
                <IndexTable.Row>
                  <IndexTable.Cell>Product AI improvement</IndexTable.Cell>
                  <IndexTable.Cell>
                    <p>Improve product data</p>
                    <Text variant={'bodyXs'}>
                      <i>(Title, Description, Category, Tags, SEO Title and
                        Description)</i>
                    </Text>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge>100 Credit / per product</Badge>
                  </IndexTable.Cell>
                </IndexTable.Row>
                {/*
                <IndexTable.Row>
                  <IndexTable.Cell>Product AI improvement with new
                    language</IndexTable.Cell>
                  <IndexTable.Cell>
                    Translate product in selected languages and enhance product
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Tooltip
                      content={'100 Credit - for improvement \n 100 Credit - for translation'}>
                      <Badge>200 Credit / per language</Badge><br/>
                    </Tooltip>
                  </IndexTable.Cell>
                </IndexTable.Row>
                  */}
              </IndexTable>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>

      {showToast && (
        <Toast content="Settings saved" onDismiss={() => setShowToast(false)}/>
      )}
    </Frame>
  );
};

export default AppSettings;
