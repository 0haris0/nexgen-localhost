import type { Prisma, product, productHistory } from "@prisma/client"; // Ensure Prisma types are imported
import dbServer from "../db.server"; // Ensure this is the proper dbServer import
import { handleApiError } from "../utils/handleApiError";

export async function saveProduct(product: product) {
  if (!product.shopify_id) {
    throw new Error("shopify_id must not be null or undefined");
  }
  const {
    shopify_id,
    shop_id,
    title,
    description,
    feedback,
    feedback_issues,
    last_checked,
    handle,
    category_id,
    category_name,
    tags,
    product_type,
    featured_image,
    seo_title,
    seo_description,
    date_created,
  } = product;

  const result = await dbServer.product.upsert({
    where: { shopify_id },
    update: {
      shop_id,
      title,
      description,
      feedback: feedback || undefined,
      feedback_issues,
      last_checked,
      handle, // new field for product handle
      category_id, // new field for category ID
      category_name, // new field for category name
      tags: tags || [], // new field for tags
      product_type, // new field for product type
      featured_image: featured_image || {}, // new field for featured image
      seo_title, // new field for SEO title
      seo_description, // new field for SEO description
    },
    create: {
      shopify_id,
      shop_id,
      title,
      description,
      feedback: feedback || undefined,
      feedback_issues,
      last_checked,
      product_status: "new",
      handle, // new field for product handle
      category_id, // new field for category ID
      category_name, // new field for category name
      tags: tags || [], // new field for tags
      product_type, // new field for product type
      featured_image: featured_image || {}, // new field for featured image
      seo_title, // new field for SEO title
      seo_description, // new field for SEO description
      date_created, // store the product's creation date
    },
  });
  if (!result) {
    throw Error("Error with saving product");
  }
  return result;
}

export async function saveProductHistory(product: productHistory) {
  if (!product || !product.id) {
    throw new Error("Product data or product ID is missing.");
  }

  try {
    return await dbServer.productHistory.create({
      data: {
        product_id: product.id,
        shopify_id: product.shopify_id,
        shop_id: product.shop_id,
        title: product.title,
        description: product.description,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        date_created: product.date_created || new Date(),
        last_checked: new Date(),
        product_status: product.product_status,
        feedback: product.feedback || undefined,
        issuesCategories: product.issuesCategories || undefined,
        feedback_issues: product.feedback_issues || 0,
        ai_correction: product.ai_correction || true,
        updated_by: product.updated_by || "AI Enhancer",
        handle: product.handle,
        category_id: product.category_id,
        category_name: product.category_name,
        tags: product.tags || [],
        product_type: product.product_type,
        featured_image: product.featured_image || {},
        newTitle: product.newTitle,
        newDescription: product.newDescription,
        newTags: product.newTags || [],
        newSeoTitle: product.newSeoTitle,
        newSeoDescription: product.newSeoDescription,
        newCategoryName: product.newCategoryName,
        newProductType: product.newProductType,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return handleApiError(error, error.message);
    } else {
      return {
        success: false,
        error: "An error occurred while saving product history",
      };
    }
  }
}

export async function getSingleProductFromHistory(productId: number) {
  try {
    return await dbServer.productHistory.findFirst({
      select: {
        newTitle: true,
        newDescription: true,
        newTags: true,
        newSeoTitle: true,
        newCategoryName: true,
        newProductType: true,
        newSeoDescription: true,
      },
      where: {
        product_id: productId,
      },
      orderBy: [
        {
          last_checked: "desc",
        },
      ],
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return handleApiError(error, error.message);
    } else {
      return {
        success: false,
        error: "An error occurred while fetching product from history",
      };
    }
  }
}

interface FilteringOptions {
  selected?: number;
  searchTerm?: string;
  order_by: keyof Prisma.productOrderByWithRelationInput; // Enforce order_by to match Prisma keys
  sort: Prisma.SortOrder; // 'asc' | 'desc'
  page: number;
  display: number;
} // Import error handler

interface FilteringByShopId {
  shop_id: number;
  options: FilteringOptions;
}

// Function to get products by shop_id
export async function getProductsByShopId({
  shop_id,
  options,
}: FilteringByShopId) {
  try {
    // Setup base query conditions
    const whereQuery: Prisma.productWhereInput = {
      shop_id,
    };

    // Apply ai_correction filter if selected is set
    if (options.selected === 1) {
      whereQuery.ai_correction = true;
    } else if (options.selected === 2) {
      whereQuery.product_status = "processed";
      whereQuery.ai_correction = true;
    }

    // Apply search term filter
    if (typeof options.searchTerm === "string" && options.searchTerm.trim()) {
      whereQuery.title = {
        contains: options.searchTerm.trim(),
      };
    }

    // Validate and parse order_by with a fallback for invalid inputs
    const orderByQuery: Prisma.productOrderByWithRelationInput = {
      [options.order_by]: options.sort,
    };

    // Fetch total count with the where query
    const totalCount = await dbServer.product.count({
      where: whereQuery,
    });

    // Fetch paginated results
    const result = await dbServer.product.findMany({
      where: whereQuery,
      skip: (options.page - 1) * options.display,
      take: options.display,
      orderBy: orderByQuery,
    });

    return {
      result,
      totalCount,
    };
  } catch (error: any) {
    console.error("Error fetching products:", error.message);
    return handleApiError(error, error.message);
  }
}

export async function getProductsById(productIds: Array<number>) {
  const result = await dbServer.product.findMany({
    where: {
      id: { in: productIds },
    },
    orderBy: [{ feedback_issues: "desc" }],
  });
  return result;
}

export async function countProductsByShopID(shop_id: number) {
  if (!shop_id) {
    throw new Error("Shop ID is required to count issues.");
  }
  try {
    return await dbServer.product.count({
      where: { shop_id },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to count products for the shop.");
  }
}

type CountIssuesResult = {
  success: boolean;
  data: Array<{
    feedback_issues: string | null;
    _count: { _all: number };
  }>;
  error?: string;
};

export async function countIssues(shop_id: number): Promise<CountIssuesResult> {
  // Validate input
  if (!shop_id) {
    throw new Error("Shop ID is required to count issues.");
  }

  try {
    const result = await dbServer.product.groupBy({
      by: ["feedback_issues"], // Group by feedback issues
      where: { shop_id }, // Filter by the provided shop ID
      _count: {
        _all: true, // Count all products within each feedback issues group
      },
      orderBy: {
        feedback_issues: "desc", // Order by feedback issues in descending order
      },
    });

    // Ensure feedback_issues is of type string | null
    const formattedResult = result.map((item) => ({
      feedback_issues: item.feedback_issues?.toString() || null,
      _count: item._count,
    }));

    return {
      success: true,
      data: formattedResult,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    } else {
      return {
        success: false,
        data: [],
        error: "An error occurred while counting issues.",
      };
    }
  }
}

export async function updateAiCorrection(productIds: Array<number>, status: boolean) {
  if (!Array.isArray(productIds)) {
    throw new Error("Not array");
  }
  return dbServer.product.updateMany({
    where: {
      id: { in: productIds }, // Use 'in' for multiple IDs
    },
    data: {
      ai_correction: status,
    },
  }); // Return the results of the update operation
}

export async function getProductsForExport() {
  const products = await dbServer.product.findMany();

  // Transform products data to flatten tags and expand feedback issues
  const transformedProducts = products.map((product) => {
    // Flatten tags (if stored as JSON array) into a single string of comma-separated values
    const tags = Array.isArray(product.tags)
      ? product.tags.join(", ")
      : product.tags;

    // Expand feedback issues: If feedback issues are an array of objects, map each key as an individual field
    const feedbackIssues = Array.isArray(product.feedback_issues)
      ? product.feedback_issues
      : [];
    const feedbackFields = feedbackIssues.reduce(
      (acc: any, issue: any, index: number) => {
        // Prefix each issue field to avoid key conflicts (e.g., issue_1, issue_2)
        acc[`issue_${index + 1}_message`] = issue.message || "N/A";
        acc[`issue_${index + 1}_type`] = issue.type || "N/A";
        return acc;
      },
      {},
    );

    // Return the transformed product object
    return {
      ...product,
      tags, // Overwrite tags field with flattened string
      ...feedbackFields, // Spread feedback issues as individual fields
    };
  });

  return transformedProducts;
}

// Fetch Enhanced Products based on specific conditions
export async function fetchEnhancedProducts(
  shop_id: number,
  isEnhanced = true,
) {
  // Define the criteria based on the shopId and enhancement status
  const products = dbServer.product.findMany({
    where: {
      shop_id,
      ai_correction: isEnhanced, // Assumes `isEnhanced` is a boolean flag in your DB
    },
  });
  if (!products) {
    throw Error("Error with products enhanced");
  }
  return products;
}

interface Enhancements {
  title?: string;
  description?: string;
  tags?: string[];
  seoKeywords?: string;
  categorySuggestion?: string;
}

export async function applyEnhancement(
  productId: number,
  enhancements: Enhancements,
) {
  // Destructure the enhancements into specific fields to update
  const { title, description, tags, seoKeywords, categorySuggestion } =
    enhancements;

  // Prepare the data for updating the product
  const updatedData = {
    ...(title && { title }), // Update title if provided
    ...(description && { description }), // Update description if provided
    ...(tags && { tags }), // Update tags if provided
    ...(seoKeywords && { seoKeywords }), // Update SEO keywords if provided
    ...(categorySuggestion && { category: categorySuggestion }), // Update category if suggested
    isEnhanced: true, // Mark the product as enhanced
  };

  // Update the product in the database
  try {
    const updatedProduct = await dbServer.product.update({
      where: { id: productId },
      data: updatedData,
    });
    return updatedProduct; // Return the updated product if needed for further actions
  } catch (error) {
    console.error(`Error applying enhancement to product ${productId}:`, error);
    throw new Error(`Could not apply enhancements to product ${productId}`);
  }
}

export async function rejectEnhancement(productId: number) {
  try {
    // Reset the 'isEnhanced' flag to false
    const updatedProduct = await dbServer.product.update({
      where: { id: productId },
      data: {
        ai_correction: false, // Reset enhancement status
        // Optionally, reset fields here if needed
      },
    });
    return updatedProduct; // Return the product data after resetting enhancement status
  } catch (error) {
    console.error(
      `Error rejecting enhancement for product ${productId}:`,
      error,
    );
    throw new Error(`Could not reject enhancements for product ${productId}`);
  }
}

export async function updateStatus(productId: number) {
  const result = await dbServer.product.update({
    where: { id: productId },
    data: {
      product_status: "processed",
    },
  });
  return result;
}
