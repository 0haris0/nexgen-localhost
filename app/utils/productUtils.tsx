// Helper function to update product details on Shopify and save to DB
import dbServer from "../db.server.js";
import { handleErrorResponse } from "./errorHandler.tsx";
import { saveProduct } from "../models/products.js";
import { lastSync, shopId } from "../models/shop.js";
import { saveIssue } from "../models/issue.js";
import { handleApiError } from "./handleApiError.tsx";

async function updateProduct(admin, productData, actionType) {
  // GraphQL mutation for updating product details
  const mutation = `
    mutation updateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          descriptionHtml
          tags
          productType
          seo {
            title
            description
          }
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Variables for the mutation
  const variables = {
    input: {
      id: productData.shopify_id,
      title: productData.newTitle,
      descriptionHtml: productData.newDescription,
      seo: {
        title: productData.newSeoTitle,
        description: productData.newSeoDescription,
      },
      tags: productData.newTags,
      productType: productData.newProductType,
    },
  };

  try {
    // Send mutation request to Shopify
    let updatedProductData;
    if (actionType === "reject") {
      updatedProductData = {
        id: productData.id,
        shopify_id: productData.shopify_id,
        product_status: "archived",
        ai_correction: false,
      };
      const updatedProduct = await dbServer.product.update({
        where: {
          id: productData.id,
          shopify_id: productData.shopify_id,
        },
        data: updatedProductData,
      });

      return {
        success: true,
        updatedProduct: updatedProduct,
        actionType: actionType,
      };
    }
    const response = await admin.graphql(mutation, { variables: variables });
    const result = await response.json();

    if (result.data.productUpdate.userErrors.length > 0) {
      console.error("User Errors:", result.data.productUpdate.userErrors);
      throw new Error("Failed to update product: User errors encountered.");
    }

    // Extract updated product data from response
    const newProduct = result.data.productUpdate.product;

    // Prepare data for database update
    updatedProductData = {
      title: newProduct.title,
      description: newProduct.descriptionHtml,
      seo_title: newProduct.seo.title,
      seo_description: newProduct.seo.description,
      tags: newProduct.tags,
      product_type: newProduct.productType,
      featured_image:
        {
          url: newProduct.images.edges[0]?.node.src,
        } || null,
      last_checked: new Date(),
      product_status: "processed",
      ai_correction: false,
      feedback: productData.feedback,
      feedback_issues: productData.feedback_issues,
      category_name: productData.newCategoryName,
      handle: productData.handle,
    };
    try {
      // Update the product in the database
      const updatedProduct = await dbServer.product.update({
        where: {
          id: productData.id,
          shopify_id: productData.shopify_id,
        },
        data: updatedProductData,
      });

      return {
        success: true,
        result,
        updatedProduct,
      };
    } catch (error) {
      console.error("Error updating product in DB:", error);
      return handleApiError(error, error.message);
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return handleApiError(error, "Product update failed: ", error.message);
  }
}

export default updateProduct;
export const analyzeProduct = (product) => {
  let feedback = [];
  let issueCount = {
    seoTitle: 0,
    seoDescription: 0,
    featuredMedia: 0,
    title: 0,
    variants: 0,
    publishedAt: 0,
    tags: 0,
    collections: 0,
    productType: 0,
    vendor: 0,
    weight: 0,
    trackInventory: 0,
  };
  try {
    // Check if SEO title is empty
    if (!product.seo?.title || product.seo.title.trim() === "") {
      issueCount.seoTitle = issueCount.seoTitle + 1;
      feedback.push({
        issue: "SEO Title",
        severity: "high",
        message: "SEO title is missing.",
      });
    }

    // Check if SEO description is empty
    if (!product.seo?.description || product.seo.description.trim() === "") {
      issueCount.seoDescription = issueCount.seoDescription + 1;
      feedback.push({
        issue: "SEO Description",
        severity: "medium",
        message: "SEO description is missing.",
      });
    }

    // Check if product has featured media (image, video, or 3D model)
    if (!product.featuredMedia || !product.featuredMedia.preview?.image?.url) {
      issueCount.featuredMedia = issueCount.featuredMedia + 1;
      feedback.push({
        issue: "Media",
        severity: "high",
        message: "Product has no featured media.",
      });
    }

    // Check if product title is missing
    if (!product.title || product.title.trim() === "") {
      issueCount.title = issueCount.title + 1;
      feedback.push({
        issue: "Title",
        severity: "high",
        message: "Product title is missing.",
      });
    }

    // Check if product description is missing or too short
    if (
      !product.descriptionHtml ||
      product.descriptionHtml.trim().length < 50
    ) {
      feedback.push({
        issue: "Description",
        severity: "medium",
        message: "Product description is missing or too short.",
      });
    }

    // Check if product has at least one variant
    if (!product.variants?.edges || product.variants.edges.length === 0) {
      issueCount.variants = issueCount.variants + 1;
      feedback.push({
        issue: "Variants",
        severity: "high",
        message: "Product has no variants.",
      });
    }

    // Check if product is published on any sales channels
    if (!product.publishedAt) {
      issueCount.publishedAt = issueCount.publishedAt + 1;
      feedback.push({
        issue: "Publication",
        severity: "medium",
        message: "Product is not published on any sales channels.",
      });
    }

    // Check if product price is set for each variant
    const priceMissing = product.variants?.edges.some(
      (variant) => !variant.node?.price || parseFloat(variant.node.price) === 0,
    );
    if (priceMissing) {
      feedback.push({
        issue: "Price",
        severity: "high",
        message: "Product price is missing or set to zero.",
      });
    }

    // Check if product tags exist
    if (!product.tags || product.tags.length === 0) {
      issueCount.tags = issueCount.tags + 1;
      feedback.push({
        issue: "Tags",
        severity: "low",
        message: "Product has no tags.",
      });
    }

    // Check if product is visible in collections
    if (!product.collections?.edges || product.collections.edges.length === 0) {
      issueCount.collections = issueCount.collections + 1;
      feedback.push({
        issue: "Collections",
        severity: "low",
        message: "Product is not part of any collection.",
      });
    }

    // Check if product has proper product type
    if (!product.productType || product.productType.trim() === "") {
      issueCount.productType = issueCount.productType + 1;
      feedback.push({
        issue: "Product Type",
        severity: "medium",
        message: "Product type is missing.",
      });
    }

    // Check if product vendor is set
    if (!product.vendor || product.vendor.trim() === "") {
      issueCount.vendor = issueCount.vendor + 1;
      feedback.push({
        issue: "Vendor",
        severity: "medium",
        message: "Product vendor is missing.",
      });
    }

    // Check if product weight is set (useful for shipping)
    if (!product.weight || product.weight === 0) {
      issueCount.weight = issueCount.weight + 1;
      feedback.push({
        issue: "Weight",
        severity: "low",
        message: "Product weight is missing.",
      });
    }

    // Check if product has proper inventory tracking enabled
    if (!product.trackInventory) {
      issueCount.trackInventory = issueCount.trackInventory + 1;
      feedback.push({
        issue: "Inventory Tracking",
        severity: "medium",
        message: "Product inventory is not being tracked.",
      });
    }

    // Check if product has a valid status
    if (
      !product.status ||
      !["ACTIVE", "ARCHIVED", "DRAFT"].includes(product.status)
    ) {
      feedback.push({
        issue: "Status",
        severity: "high",
        message: "Product status is invalid.",
      });
    }

    // Default feedback message if product is fully optimized
    if (feedback.length === 0) {
      feedback.push({ message: "Product is fully optimized." });
    }
  } catch (error) {
    console.error("Error analyzing product:", e);
    throw new Error(error.message);
  }

  // Return both feedback and issue counts
  return {
    feedback,
    issueCount,
  };
};
export const fetchProductsQuery = async (admin) => {
  try {
    // Fetch products using Shopify GraphQL
    const storeData = await admin
      .graphql(
        `
        #graphql
        query getProducts {
          shop { id name }
          products(first: 250, query: "status:ACTIVE") {
            edges {
              node {
                id handle title description
                category { id fullName name }
                tags productType
                featuredMedia { mediaContentType alt preview { image { url width height } } }
                seo { title description }
                status updatedAt createdAt
              }
            }
            pageInfo { hasNextPage hasPreviousPage }
          }
          productsCount(query: "status:ACTIVE") { count }
        }
      `,
      )
      .then((result) => result.json())
      .then((data) => data.data);

    const productEdges = storeData.products.edges;
    const shopifyId = storeData.shop.id;
    const shopIdVal = await shopId(shopifyId);

    for (const { node: product } of productEdges) {
      const { feedback, issueCount } = analyzeProduct(product);
      // Save the analyzed product data
      const newProduct = await saveProduct({
        shopify_id: product.id,
        shop_id: shopIdVal,
        title: product.title,
        description: product.description,
        feedback,
        feedback_issues: feedback.length,
        last_checked: new Date(product.updatedAt),
        handle: product.handle,
        category_id: product.category?.id,
        category_name: product.category?.name,
        tags: product.tags,
        product_type: product.productType,
        featured_image: {
          url: product.featuredMedia?.preview?.image?.url,
        },
        seo_title: product.seo?.title,
        seo_description: product.seo?.description,
        date_created: new Date(product.createdAt),
      });

      // Save product issues in the database
      await saveIssue(shopIdVal, issueCount, newProduct.id, product.id);

      // Update last sync time for this product
      await lastSync(shopIdVal, shopifyId);
    }
    return {
      success: true,
      productsCount: storeData.productsCount.count,
    };
  } catch (error) {
    console.error(error.message);
    handleErrorResponse(error.message);
  }
  return {
    success: false,
    productsCount: 0,
  };
};
