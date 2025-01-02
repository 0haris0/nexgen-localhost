import React from "react";
import {
  Card,
  Badge,
  Thumbnail,
  Text,
  BlockStack,
  InlineStack,
  ButtonGroup,
  Button,
  Tag,
} from "@shopify/polaris";
import {
  CheckIcon,
  DomainNewIcon,
  PlusIcon,
  XIcon,
} from "@shopify/polaris-icons";
import { escapeHtml } from "@remix-run/react/dist/markup.js";

const SingleProduct = (props) => {
  const product = props.product;

  function checkImageSize(width, height) {
    // Calculate aspect ratio
    const aspectRatio = width / height;
    const requiredRatio = 1;

    const idealArea = 2100 * 2100; // Ideal area for perfect size (2100x2100)
    const imageArea = width * height; // Actual area of the input image

    const areaDifference = Math.abs(imageArea - idealArea) / idealArea;

    // Calculate size level
    let sizeLevel;
    if (imageArea <= 1100 * 1100) {
      sizeLevel = 1; // Too small
    } else if (areaDifference <= 0.05) {
      sizeLevel = 5; // Perfect size
    } else if (areaDifference <= 0.1) {
      sizeLevel = 4; // Very close to perfect
    } else if (areaDifference <= 0.2) {
      sizeLevel = 3; // Slightly off
    } else if (areaDifference <= 0.3) {
      sizeLevel = 2; // Noticeable deviation
    } else if (areaDifference <= 0.5) {
      sizeLevel = 1; // Further off
    } else {
      sizeLevel = 1; // Too large or too small
    }

    // Calculate ratio level: close to 1:1 gives higher score
    const ratioDifference = Math.abs(aspectRatio - requiredRatio);
    const ratioLevel = Math.max(0, 10 - ratioDifference * 10);

    // Return array [sizeLevel, ratioLevel]
    return [sizeLevel, Math.round(ratioLevel)];
  }

  function assignSizeBadge(size) {
    let tone;

    // Assign badge based on size level
    if (size === 10) {
      tone = "Success"; // Perfect size
    } else if (size >= 8) {
      tone = "Complete"; // Close to perfect
    } else if (size >= 6) {
      tone = "Attention"; // Slightly off
    } else if (size >= 3) {
      tone = "Warning"; // Noticeable deviation
    } else {
      tone = "Critical"; // Size is bad (too big or too small)
    }

    return <Badge tone={tone}>Size Level: {size}</Badge>;
  }

  function assignRatioBadge(ratio) {
    let tone;

    // Assign badge based on ratio level
    if (ratio === 10) {
      tone = "Success"; // Perfect ratio
    } else if (ratio >= 8) {
      tone = "Complete"; // Close to perfect
    } else if (ratio >= 6) {
      tone = "Attention"; // Slightly off
    } else if (ratio >= 3) {
      tone = "Warning"; // Noticeable deviation
    } else {
      tone = "Critical"; // Ratio is bad
    }

    return <Badge tone={tone}>Ratio Level: {ratio}</Badge>;
  }

  function ImageEvaluation({ width, height }) {
    const [sizeLevel, ratioLevel] = checkImageSize(width, height);

    return (
      <div>
        {assignSizeBadge(sizeLevel)}
        {assignRatioBadge(ratioLevel)}
      </div>
    );
  }

  function handleTag(tag) {
    product.tags.push(tag);
  }

  return (
    <Card title={product.title} sectioned>
      {product.id}
      <BlockStack gap="4">
        {/* Osnovne informacije o proizvodu */}
        <Text as={"h3"} variant={"headingLg"}>
          {product.title}
        </Text>
        {escapeHtml(product.descriptionHtml)}

        {/* Kategorija i Tip proizvoda */}
        <InlineStack gap="4" align={"start"}>
          <Text as="span" fontWeight="bold">
            Category:
          </Text>
          <Text as="span">
            {product.category?.fullName || product.category?.name || "N/A"}
          </Text>
          <Text as="span" fontWeight="bold">
            Product Type:
          </Text>
          <Text as="span">{product.productType || "N/A"}</Text>
        </InlineStack>

        {/* Tagovi */}
        <InlineStack gap={2}>
          <Text as="span" fontWeight="bold">
            Tags:
          </Text>
          {product.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </InlineStack>
        <InlineStack gap={2}>
          <Text as="span" fontWeight="bold">
            Recomended tags:
          </Text>
          <Tag
            tone={"new"}
            icon={DomainNewIcon}
            onClick={() => handleTag("Tag 1")}
          >
            Tag 1
          </Tag>
        </InlineStack>

        {/* Informacije o Mediji */}
        {product.featuredImage ? (
          <Text as={"span"} fontWeight={"bold"} tone={"critical"}>
            Image size: {product.featuredImage?.width} x{" "}
            {product.featuredImage?.height}{" "}
            {ImageEvaluation({
              width: product.featuredImage?.width,
              height: product.featuredImage?.height,
            })}
            {checkImageSize(
              product.featuredImage?.width,
              product.featuredImage?.height,
            )}
          </Text>
        ) : null}
        {product.featuredImage?.url && (
          <Thumbnail
            alt={product.featuredImage?.alt || "Product Media"}
            source={product.featuredImage?.url}
            size="large"
          />
        )}

        {/* SEO Informacije */}
        <BlockStack gap="2">
          <Text as="span" fontWeight="bold">
            SEO Title:
          </Text>
          <Text as="span">{product.seo.title || "N/A"}</Text>
          <Text as="span" fontWeight="bold">
            SEO Description:
          </Text>
          <Text as="span">{product.seo.description || "N/A"}</Text>
        </BlockStack>

        {/* Status */}
        <Badge status={product.status === "active" ? "success" : "critical"}>
          {product.status}
        </Badge>

        {/* Timestamps */}
        <InlineStack gap="4">
          <Text as="span" color="subdued">
            Created At:
          </Text>
          <Text as="span">{new Date(product.createdAt).toLocaleString()}</Text>
          <Text as="span" color="subdued">
            Last Updated:
          </Text>
          <Text as="span">{new Date(product.updatedAt).toLocaleString()}</Text>
        </InlineStack>
      </BlockStack>
      <InlineStack align="end">
        <ButtonGroup>
          <Button onClick={() => {}} accessibilityLabel="Fulfill items">
            Fulfill items
          </Button>
          <Button
            icon={PlusIcon}
            variant="primary"
            onClick={() => {}}
            accessibilityLabel="Create shipping label"
          >
            Create shipping label
          </Button>
        </ButtonGroup>
      </InlineStack>
    </Card>
  );
};

export default SingleProduct;
