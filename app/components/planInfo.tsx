import React from "react";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  InlineStack,
  ProgressBar,
  Text,
} from "@shopify/polaris";

export default function PlanInfo({ plan, productCount, finishedCount }) {
  return (
    <Card>
      <Text as="h2" variant="headingMd">
        Product Info
      </Text>
      <BlockStack gap="200">
        <Text as="span" variant="bodyMd" tone="base">
          We are currently analyzing your product shop to identify areas for
          improvement.
          <br />
          Please hold on while we gather insights to help optimize your listings
          for better performance.
          <br />
          This may take a few moments depending on the number of products.
        </Text>

        <ProgressBar
          progress={(finishedCount / productCount) * 100}
          aria-label="Product shop analysis progress"
        />

        <InlineStack align="space-between" gap="200">
          <InlineStack gap="200">
            <Badge tone="info">
              Number of products:{" "}
              <Text as="span" fontWeight="bold">
                {productCount}
              </Text>
            </Badge>
          </InlineStack>

          <Box>
            <Badge tone="success">
              Finished products:{" "}
              <Text as="span" fontWeight="bold">
                {finishedCount}
              </Text>
            </Badge>
          </Box>
        </InlineStack>

        {plan && (
          <Box padding="4">
            <Badge tone="highlight">
              User Plan:{" "}
              <Text as="span" fontWeight="bold">
                {plan}
              </Text>
            </Badge>
          </Box>
        )}
      </BlockStack>
    </Card>
  );
}
