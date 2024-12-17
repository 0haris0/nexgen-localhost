import dbServer from "../db.server";

export const saveIssue = (
  shop_id: number,
  issuesCount: issueCount,
  product_id: number,
  shopify_product_id: string,
) => {
  const result = dbServer.issues.upsert({
    where: { product_id },
    update: {
      issuesCount,
    },
    create: {
      shop_id,
      issuesCount,
      product_id,
      shopify_product_id,
    },
  });
  return result;
};

export const categoryValuesSum = async (shopIdVal: number) => {
  // Execute the SQL query to get the sum of JSON fields
  const response: Array<any> = await dbServer.$queryRaw`
    SELECT SUM(COALESCE(("issuesCount" ->> 'title')::int, 0))          AS total_title,
           SUM(COALESCE(("issuesCount" ->> 'tags')::int, 0))           AS total_tags,
           SUM(COALESCE(("issuesCount" ->> 'vendor')::int, 0))         AS total_vendor,
           SUM(COALESCE(("issuesCount" ->> 'weight')::int, 0))         AS total_weight,
           SUM(COALESCE(("issuesCount" ->> 'seoTitle')::int, 0))       AS total_seoTitle,
           SUM(COALESCE(("issuesCount" ->> 'variants')::int, 0))       AS total_variants,
           SUM(COALESCE(("issuesCount" ->> 'collections')::int, 0))    AS total_collections,
           SUM(COALESCE(("issuesCount" ->> 'productType')::int, 0))    AS total_productType,
           SUM(COALESCE(("issuesCount" ->> 'publishedAt')::int, 0))    AS total_publishedAt,
           SUM(COALESCE(("issuesCount" ->> 'featuredMedia')::int, 0))  AS total_featuredMedia,
           SUM(COALESCE(("issuesCount" ->> 'seoDescription')::int, 0)) AS total_seoDescription,
           SUM(COALESCE(("issuesCount" ->> 'trackInventory')::int, 0)) AS total_trackInventory
    FROM issues
    WHERE shop_id = ${shopIdVal};
  `;
  // Transform the result to the desired format
  const result = [
    {
      dataTitle: "Missing tags",
      dataValue: Number(response[0].total_tags),
    },
    {
      dataTitle: "Missing vendor",
      dataValue: Number(response[0].total_vendor),
    },
    {
      dataTitle: "Missing weight",
      dataValue: Number(response[0].total_weight),
    },
    {
      dataTitle: "Missing SEO title",
      dataValue: Number(response[0].total_seotitle),
    },
    {
      dataTitle: "Missing SEO description",
      dataValue: Number(response[0].total_seodescription),
    },
    {
      dataTitle: "Without collection",
      dataValue: Number(response[0].total_collections),
    },
    {
      dataTitle: "Without Product type",
      dataValue: Number(response[0].total_producttype),
    },
    {
      dataTitle: "Sales channel missing",
      dataValue: Number(response[0].total_publishedat),
    },
    {
      dataTitle: "Without image",
      dataValue: Number(response[0].total_featuredmedia),
    },
    {
      dataTitle: "Missing Inventory",
      dataValue: Number(response[0].total_trackinventory),
    },
  ];
  return result;
};
