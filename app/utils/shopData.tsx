import { handleApiError } from "./handleApiError";
import { saveShop } from "../models/shop.js"; // Fetches the shop ID and API key

// Fetches the shop ID and API key
export const shopifyShopId = async (admin: any) => {
  try {
    // Execute the GraphQL request to get the shop's ID
    const response = await admin.graphql(`#query { shop { id } }`);
    const parsedResponse = await response.json();

    if (!parsedResponse.data?.shop) {
      return {
        success: false,
        error: "No shop or products found.",
      };
    }

    return parsedResponse.data.shop.id;
    // Return the shop ID and API key if found
  } catch (e: unknown) {
    // Handle any errors using the handleApiError function
    return handleApiError(e, "Error loading shop data");
  }
};
// GraphQL Queries
export const fetchShopQuery = async (admin: any) => {
  const query = `
    #graphql
    query getShopData {
      shop {
        id
        name
        primaryDomain { id host url }
        url
        unitSystem
        currencyCode
        description
        plan { displayName }
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
      productsCount { count }
    }`;

  let response;
  try {
    const result = await admin.graphql(query);
    response = (await result.json()).data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return handleApiError(error, error.message);
    } else {
      console.error("An error occurred while fetching shop data");
      return {
        success: false,
        error: "An error occurred while fetching shop data",
      };
    }
  }

  const shop = response.shop;
  const productCount = response.productsCount?.count || 0;
  const activeSubscriptions =
    response.currentAppInstallation?.activeSubscriptions || [];

  const planMapping = [
    {
      name: "Trial plan",
      id: 1,
    },
    {
      name: "Basic plan",
      id: 2,
    },
    {
      name: "Professional plan",
      id: 3,
    },
    {
      name: "Enterprise plan",
      id: 4,
    },
  ];
  //TODO: FIX THIS
  // const planId = planMapping[activeSubscriptions[0]?.name] || 1;
  const planId = 1;
  try {
    const savedStoreData = await saveShop(shop, productCount, planId);

    return {
      success: true,
      shop: savedStoreData,
      subscription: activeSubscriptions,
      productNumber: productCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      return handleApiError(error, error.message);
    } else {
      return {
        success: false,
        error: "An error occurred while fetching product from history",
      };
    }
  }
};
