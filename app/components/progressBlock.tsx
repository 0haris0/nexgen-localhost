import React, { useEffect, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Card,
  Divider,
  InlineStack,
  Layout,
  ProgressBar,
  Text,
} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";

export default function ProgressBlock({
  totalProducts,
  timePerProduct,
  isVisible,
  toggleProgress,
}) {
  const [progress, setProgress] = useState(0);
  const [finishedProducts, setFinishedProducts] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      // Check if totalProducts is greater than zero to avoid NaN
      if (totalProducts > 0) {
        setProgress((finishedProducts / totalProducts) * 100);
      } else {
        setProgress(0); // Fallback to 0 when there are no products
      }

      if (finishedProducts < totalProducts) {
        setFinishedProducts(finishedProducts + 1);
      } else if (finishedProducts === totalProducts) {
        toggleProgress(true);
      }
    }, 200);
  }, [progress, finishedProducts, totalProducts]);

  // Ensure progress doesn't throw error when totalProducts is 0

  if (!isVisible) {
    return null;
  }

  return (
    <Layout.Section>
      <Banner
        title="Analyzing product shop..."
        icon={InfoIcon}
        onDismiss={() => toggleProgress(false)}
      >
        <BlockStack gap="300">
          <Text as="span" variant="bodyMd" tone="base">
            We are currently analyzing your product shop to identify areas for
            improvement.
            <br /> Please hold on while we gather insights to help optimize your
            listings for better performance. <br /> This may take a few moments
            depending on the number of products.
          </Text>
          <ProgressBar progress={isNaN(progress) ? 0 : progress} />

          <InlineStack align="space-between" gap="300">
            <InlineStack gap="300">
              <Badge status="info">
                Time per product:{" "}
                <Text as="span" fontWeight="medium">
                  1s
                </Text>
              </Badge>
              <Badge status="info">
                Number of products:{" "}
                <Text as="span" fontWeight="bold">
                  {totalProducts}
                </Text>
              </Badge>
            </InlineStack>
            <Box>
              <Badge status="success">
                Finished products:{" "}
                <Text as="span" fontWeight="bold">
                  {finishedProducts}
                </Text>
              </Badge>
            </Box>
          </InlineStack>
        </BlockStack>
      </Banner>
    </Layout.Section>
  );
}
