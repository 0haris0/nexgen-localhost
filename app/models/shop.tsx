import dbServer from "../db.server";

interface Shop {
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
}

export async function saveShop(
  shop: Shop,
  total_products: number,
  planId: number,
) {
  const { id, name, currencyCode, url } = shop;

  if (!id) {
    throw new Error("shopify_id must not be null or undefined");
  }
  const response = dbServer.shops.upsert({
    where: { shopify_shop_id: id },
    update: {
      shop_name: name,
      planId: planId,
      store_currency: currencyCode,
      notes: shop.notes,
      shop_url: url,
      total_products: total_products,
    },
    create: {
      shopify_shop_id: id,
      shop_name: name,
      planId: planId,
      store_currency: currencyCode,
      notes: shop.notes,
      shop_url: url,
      total_products: total_products,
    },
  });
  if (!response) {
    throw Error("Error with saving shop");
  }
  return response;
}

export const updateCredit = async (shop_id: string, creditAmount: number) => {
  const result = await dbServer.shops.update({
    where: {
      shopify_shop_id: shop_id,
    },
    data: {
      credit: creditAmount,
    },
  });
  if (!result) {
    throw Error("Error with updating credit");
  }
  return result;
};

export const getCredit = async (shop_id: string) => {
  const result = await dbServer.shops.findUnique({
    select: {
      credit: true,
    },
    where: {
      shopify_shop_id: shop_id,
    },
  });
  if (!result) {
    throw Error("Error with getting credit for shop");
  }
  return result.credit;
};

export async function lastSync(shop_id: number, shopifyId: string) {
  const response = await dbServer.shops.update({
    where: {
      id: shop_id,
    },
    data: {
      last_sync: new Date(),
      needResync: false,
    },
  });
  return response;
}

//Database
export async function shopId(shopify_shop_id: string): Promise<number> {
  const response = await dbServer.shops.findUnique({
    where: {
      shopify_shop_id,
    },
    select: {
      id: true,
    },
  });
  if (!response) {
    throw new Error(`Shop not found for shopify_shop_id: ${shopify_shop_id}`);
  }
  return response.id;
}
