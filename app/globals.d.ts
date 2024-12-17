import type { shops } from "@prisma/client";
import type { ActiveSubscriptions } from "@shopify/shopify-api";

declare module "*.css";
export type Store = {
  success: boolean; // Indicates if the operation was successful
  shop: shops; // Shop details
  subscription: ActiveSubscriptions; // Active subscriptions
  productNumber: number; // Number of products
  error?: string; // Optional error message
};

export type Shop = {
  id: string;
  name: string;
  currencyCode: string;
  url: string;
  timezone: string;
  shopify_shop_id: string;
  notes: string;
  total_products: number;
  planId: number;
  credit_amount: number;
  subscription_status: string;
  subscription_end_date: Date;
  created_at: Date;
  updated_at: Date;
  last_payment_date: Date;
  last_payment_amount: number;
  last_payment_method: string;
  last_payment_failed: boolean;
  last_payment_error_message: string;
  last_payment_attempt_date: Date;
  last_payment_attempt_failed: boolean;
  last_payment_attempt_error_message: string;
};

export type Issue = { dataValue: number; dataTitle: string };
