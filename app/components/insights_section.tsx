/*
function exportButton() {
  return (
    <>
      <Button
        onClick={() => {
          const file = this.fetcher.load("/export-csv");
        }}
      >
        Export CSV
      </Button>
      <Button
        onClick={() => {
          window.location.href = "/export-excel";
        }}
      >
        Export excel
      </Button>
      ;
    </>
  );
}
*/
import { BlockStack, Card, List, Text } from "@shopify/polaris";
import React from "react";

export function InsightsSection() {
  return (
    <BlockStack gap="200">
      <Card>
        <Text as="h2" variant="headingMd">
          Shop Performance Insights
        </Text>
        <List type="bullet">
          <List.Item>
            Average product view increased by <b>25%</b> with SEO improvements.
          </List.Item>
          <List.Item>
            Optimized descriptions led to a <b>20%</b> boost in conversion
            rates.
          </List.Item>
          <List.Item>
            Better categorization reduced bounce rates by <b>15%</b>.
          </List.Item>
          <List.Item>
            Inventory tracking reduced <b>out-of-stock</b> incidents, improving
            satisfaction.
          </List.Item>
        </List>
      </Card>
    </BlockStack>
  );
}
