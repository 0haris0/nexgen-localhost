// Converted to TypeScript
import React from 'react';
import {Outlet, useLoaderData, useRouteError} from '@remix-run/react';
import {boundary} from '@shopify/shopify-app-remix/server';
import {AppProvider} from '@shopify/shopify-app-remix/react';
import {NavMenu} from '@shopify/app-bridge-react';
import polarisStyles from '@shopify/polaris/build/esm/styles.css?url';
import {authenticate} from '../shopify.server';
import {ShopProvider} from '../utils/ShopContext.js';
import {Analytics} from '@vercel/analytics/remix';
import {SpeedInsights} from '@vercel/speed-insights/remix';
import {LoaderFunctionArgs} from "@remix-run/node";

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

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return {apiKey: process.env.SHOPIFY_API_KEY || ''};
};

export function App() {
  const {apiKey} = useLoaderData();
  return (
    <AppProvider
      isEmbeddedApp
      apiKey={apiKey}
      i18n={{
        ResourceList: {
          sortingLabel: 'Sort by',
          defaultItemSingular: 'item',
          defaultItemPlural: 'items',
          showing: 'Showing {itemsCount} {resource}',
          Item: {
            viewItem: 'View details for {itemName}',
          },
        },
        Common: {
          checkbox: 'checkbox',
        },
      }}
    >
      <NavMenu>
        <a href="/app" rel="home">Dashboard</a>
        <a href="/app/products">Products</a>
        <a href="/app/regenerate">AI Enhancement</a>
        <a href="/app/settings">Settings</a>
      </NavMenu>
      {/* Outlet will render the current nested route component */}
      <ShopProvider children={Outlet}>
        <Outlet/>
      </ShopProvider>
      <Analytics/>
      <SpeedInsights/>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Error in route:', error);
  return boundary.error(error);
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
