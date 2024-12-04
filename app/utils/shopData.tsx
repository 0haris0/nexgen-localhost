import {handleApiError} from './handleApiError.tsx';
import {saveShop} from '../models/shop.js';

// Fetches the shop ID and API key
export const shopifyShopId  = async (admin) =>
  {
  try {
    // Execute the GraphQL request to get the shop's ID
    const response       = await admin.graphql(`#query { shop { id } }`);
    const parsedResponse = await response.json();

    if (!parsedResponse.data?.shop) {
      return {
        success: false,
        error  : 'No shop or products found.',
      };
    }

    return parsedResponse.data.shop.id;
    // Return the shop ID and API key if found
  } catch (e: unknown) {
    // Handle any errors using the handleApiError function
    return handleApiError(e, 'Error loading shop data');
  }
  };
// GraphQL Queries
export const fetchShopQuery = async (admin) =>
  {
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
    response     = (await result.json()).data;
  } catch (error) {
    console.error('GraphQL Request Error:', error);
    return handleApiError(error, error.message);

  }

  const shop                = response.shop;
  const productCount        = response.productsCount?.count || 0;
  const activeSubscriptions = response.currentAppInstallation?.activeSubscriptions ||
    [];

  const planMapping = {
    'Trial'            : 1,
    'Basic plan'       : 2,
    'Professional plan': 3,
    'Enterprise plan'  : 4,
  };
  const planId      = planMapping[activeSubscriptions[0]?.name] || 1;

  try {
    const savedStoreData = await saveShop(shop, productCount, planId);

    return {
      success      : true,
      shop         : savedStoreData,
      subscription : activeSubscriptions,
      productNumber: productCount,
    };
  } catch (error) {
    console.error('Save Shop or Issues Processing Error:', error.message);
    return handleApiError(error, error.message);
  }
  };
