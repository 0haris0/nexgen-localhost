// Converted to TypeScript
import {ActionFunctionArgs, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {authenticate} from "../shopify.server.js";
import {Page} from "@shopify/polaris";

const graphQL =
  "#graphql query getApp($idS: ID!) { node(id: $idS) { ... on AppSubscription { status } } }";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  const shop = url.searchParams.get("shop");

  if (!shop || !chargeId) {
    throw new Response("Missing required parameters", {status: 400});
  }

  try {
    // Perform the GraphQL query to get the subscription status
    const response = await admin.graphql(graphQL, {
      idS: "gid://shopify/AppSubscription/" + chargeId,
    });

    const responseJson = await response.json();

    // Get the status of the subscription from the response
    const status = responseJson.data.node.status;

    // Redirect the user based on the subscription status
    if (status === "ACTIVE") {
      return redirect(`/app/subscription-success?shop=${shop}`);
    } else if (status === "PENDING") {
      return redirect(`/app/subscription-pending?shop=${shop}`);
    } else {
      return redirect(`/app/subscription-failed?shop=${shop}`);
    }
  } catch (error) {
    console.error("Error verifying subscription status:", error);
    throw new Response("Error verifying subscription status", {status: 500});
  }
};

export const action = async ({request}: ActionFunctionArgs) => {
  return null;
};

// Optional helper function to verify subscription status directly (not used in loader anymore)
async function verifySubscriptionStatus(shop, chargeId) {
  const apiVersion = "2023-07"; // Update based on your Shopify API version
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  const response = await fetch(
    `https://${shop}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `
        {
          node(id: "gid://shopify/AppSubscription/${chargeId}") {
            ... on AppSubscription {
              status
            }
          }
        }`,
      }),
    },
  );

  const data = await response.json();
  return data.data.node.status;
}

// Main ReturnUrl component to display data (for debugging purposes)
export function ReturnUrl() {
  const data = useLoaderData();
  return <Page>{JSON.stringify(data)}</Page>;
}
