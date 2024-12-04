import React from 'react';
import { Badge, BlockStack, Box, Card, InlineStack, ProgressBar, Text } from "@shopify/polaris";

export default function StatusInfo() {
  const productCount = 55; // Can make this dynamic later
  const finishedCount = 55; // Can be dynamic as well

  return (
    <Card>
      <Text as="h2" variant="headingMd">
        Product info
      </Text>
      <BlockStack gap="loose">

        <Text as="span" variant="bodyMd" tone="base">
          We are currently analyzing your product shop to identify areas for improvement.<br />
          Please hold on while we gather insights to help optimize your listings for better performance.<br />
          This may take a few moments depending on the number of products.
        </Text>

        <ProgressBar progress={33} aria-label="Product shop analysis progress" />

        <InlineStack align="space-between" gap="loose">
          <InlineStack gap="loose">
            <Badge tone="info">
              Number of products: <Text as="span" fontWeight="bold">{productCount}</Text>
            </Badge>
          </InlineStack>

          <Box>
            <Badge tone="success">
              Finished products: <Text as="span" fontWeight="bold">{finishedCount}</Text>
            </Badge>
          </Box>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
