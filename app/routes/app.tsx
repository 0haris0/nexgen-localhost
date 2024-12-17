// Converted to TypeScript
import React, {useEffect} from 'react';
import { Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { boundary } from '@shopify/shopify-app-remix/server';
import { AppProvider } from '@shopify/shopify-app-remix/react';
import { NavMenu } from '@shopify/app-bridge-react';
import polarisStyles from '@shopify/polaris/build/esm/styles.css?url';
import { authenticate } from '../shopify.server';
import { ShopProvider, useShop } from '../utils/ShopContext.js';
import { Analytics } from '@vercel/analytics/remix';
import { SpeedInsights } from '@vercel/speed-insights/remix';
import type { LoaderFunctionArgs } from "@remix-run/node";
import { fetchShopQuery } from '../utils/shopData';
import { handleErrorResponse } from '../utils/errorHandler';
import { countProductsByShopID } from '../models/products';
import type { Store } from '../globals';
import { shops } from '@prisma/client';
import { ActiveSubscriptions } from '@shopify/shopify-api';

// Remix will automatically handle the routes based on the file structure

// All routes will inherit this configuration,
// unless a route overrides the config option
export const config = {
  maxDuration: 10,
};

export const links = () => [
  {
    rel: 'stylesheet',
    href: polarisStyles,
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  let storeData: Store = {
    productNumber: 0,
    shop: {} as shops,
    subscription: {} as ActiveSubscriptions,
    success: false,
  };

  try {
    const fetchedData = await fetchShopQuery(admin);
    if (!fetchedData || !fetchedData?.success || !fetchedData?.shop) {
      throw new Error("No data returned from the GraphQL API.");
    }
    storeData = fetchedData as Store;
    await countProductsByShopID(storeData.shop.id);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return handleErrorResponse(err.message);
    }
  }
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    storeData
  };
};

export default function App() {
  const { apiKey, storeData: initialStoreData } = useLoaderData() as {
    apiKey: string,
    storeData: Store
  };
  const { storeMainData, setStoreMainData } = useShop();

  useEffect(() => {
    if(initialStoreData){
      console.log(initialStoreData, "initialStoreData");
      setStoreMainData(initialStoreData);
    }
  }, [initialStoreData, setStoreMainData]);

  return (
    <AppProvider
      isEmbeddedApp
      apiKey={apiKey}
      i18n={{
        ResourceList: {
          sortingLabel: "Sort by",
          defaultItemSingular: "item",
          defaultItemPlural: "items",
          showing: "Showing {itemsCount} {resource}",
          Item: {
            viewItem: "View details for {itemName}",
          },
        },
        Common: {
          checkbox: "checkbox",
        },
      }}
    >
      <ShopProvider>
        <NavMenu>
          <a href="/app" rel="home">
            Dashboard
          </a>
          <a href="/app/products">Products</a>
          <a href="/app/regenerate">AI Enhancement</a>
          <a href="/app/settings">Settings</a>
        </NavMenu>
        <Outlet />
        <Analytics />
        <SpeedInsights />
      </ShopProvider>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  console.error("Error in route:", error);
  return boundary.error(error);
}

export const headers = (headersArgs: any) => {
  return boundary.headers(headersArgs);
};
