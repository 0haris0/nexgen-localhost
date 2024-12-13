/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetSubscriptionQueryVariables = AdminTypes.Exact<{
  idS: AdminTypes.Scalars['ID']['input'];
}>;


export type GetSubscriptionQuery = { node?: AdminTypes.Maybe<(
    Pick<AdminTypes.AppSubscription, 'id' | 'name' | 'status' | 'createdAt' | 'test' | 'trialDays' | 'currentPeriodEnd'>
    & { lineItems: Array<(
      Pick<AdminTypes.AppSubscriptionLineItem, 'id'>
      & { plan: { pricingDetails: (
          { __typename: 'AppRecurringPricing' }
          & Pick<AdminTypes.AppRecurringPricing, 'interval'>
          & { price: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }
        ) | { __typename: 'AppUsagePricing' } } }
    )> }
  )> };

export type GetResponseShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetResponseShopQuery = { shop: (
    Pick<AdminTypes.Shop, 'id' | 'name' | 'myshopifyDomain' | 'url' | 'unitSystem' | 'currencyCode' | 'contactEmail' | 'description'>
    & { primaryDomain: Pick<AdminTypes.Domain, 'id' | 'host' | 'url'>, plan: Pick<AdminTypes.ShopPlan, 'displayName'>, billingAddress: Pick<AdminTypes.ShopAddress, 'address1' | 'city' | 'country' | 'phone' | 'zip' | 'formatted'> }
  ), productsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>>, currentAppInstallation: { activeSubscriptions: Array<Pick<AdminTypes.AppSubscription, 'id' | 'name' | 'test' | 'status' | 'createdAt' | 'trialDays' | 'currentPeriodEnd'>> } };

export type GetProductsQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetProductsQuery = { shop: Pick<AdminTypes.Shop, 'id' | 'name'>, products: { edges: Array<{ node: (
        Pick<AdminTypes.Product, 'id' | 'handle' | 'title' | 'description' | 'tags' | 'productType' | 'status' | 'updatedAt' | 'createdAt'>
        & { category?: AdminTypes.Maybe<Pick<AdminTypes.TaxonomyCategory, 'id' | 'fullName' | 'name'>>, featuredMedia?: AdminTypes.Maybe<(
          Pick<AdminTypes.ExternalVideo, 'mediaContentType' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'width' | 'height'>> }> }
        ) | (
          Pick<AdminTypes.MediaImage, 'mediaContentType' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'width' | 'height'>> }> }
        ) | (
          Pick<AdminTypes.Model3d, 'mediaContentType' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'width' | 'height'>> }> }
        ) | (
          Pick<AdminTypes.Video, 'mediaContentType' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'width' | 'height'>> }> }
        )>, seo: Pick<AdminTypes.Seo, 'title' | 'description'> }
      ) }>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage'> }, productsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>> };

export type GetShopDataQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetShopDataQuery = { shop: (
    Pick<AdminTypes.Shop, 'id' | 'name' | 'url' | 'unitSystem' | 'currencyCode' | 'description'>
    & { primaryDomain: Pick<AdminTypes.Domain, 'id' | 'host' | 'url'>, plan: Pick<AdminTypes.ShopPlan, 'displayName'> }
  ), currentAppInstallation: { activeSubscriptions: Array<Pick<AdminTypes.AppSubscription, 'id' | 'name' | 'test' | 'status' | 'createdAt' | 'trialDays' | 'currentPeriodEnd'>> }, productsCount?: AdminTypes.Maybe<Pick<AdminTypes.Count, 'count'>> };

interface GeneratedQueryTypes {
  "#graphql\n    query getSubscription($idS: ID!) {\n      node(id: $idS) {\n        ... on AppSubscription {\n          id\n          name\n          status\n          createdAt\n          test\n          trialDays\n          currentPeriodEnd\n          lineItems {\n            id\n            plan {\n              pricingDetails {\n                __typename\n                ... on AppRecurringPricing {\n                  interval\n                  price {\n                    amount\n                    currencyCode\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }": {return: GetSubscriptionQuery, variables: GetSubscriptionQueryVariables},
  "\n    #graphql\n    query getResponseShop{\n      shop{\n        id\n        name\n        primaryDomain {\n          id\n          host\n          url\n        }\n        myshopifyDomain\n        url\n        unitSystem\n        currencyCode\n        contactEmail\n        name\n        description\n        plan{\n          displayName\n        }\n        billingAddress{address1,city,country,phone, zip,formatted}\n      }\n      productsCount{\n        count\n      }\n      currentAppInstallation {\n        activeSubscriptions {\n          id\n          name\n          test\n          status\n          createdAt\n          trialDays\n          currentPeriodEnd\n        }\n      }\n\n    }\n  ": {return: GetResponseShopQuery, variables: GetResponseShopQueryVariables},
  "\n        #graphql\n        query getProducts {\n          shop { id name }\n          products(first: 250, query: \"status:ACTIVE\") {\n            edges {\n              node {\n                id handle title description\n                category { id fullName name }\n                tags productType\n                featuredMedia { mediaContentType alt preview { image { url width height } } }\n                seo { title description }\n                status updatedAt createdAt\n              }\n            }\n            pageInfo { hasNextPage hasPreviousPage }\n          }\n          productsCount(query: \"status:ACTIVE\") { count }\n        }\n      ": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "\n    #graphql\n    query getShopData {\n      shop {\n        id\n        name\n        primaryDomain { id host url }\n        url\n        unitSystem\n        currencyCode\n        description\n        plan { displayName }\n      }\n      currentAppInstallation {\n        activeSubscriptions {\n          id\n          name\n          test\n          status\n          createdAt\n          trialDays\n          currentPeriodEnd\n        }\n      }\n      productsCount { count }\n    }": {return: GetShopDataQuery, variables: GetShopDataQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
