// Subcomponents
import type { Issue } from "../globals";
import { BlockStack, Card, Text } from "@shopify/polaris";
import IssueListChart from "./issueListChart";
import React from "react";

export function IssueListCharts({
  issues,
  issuesCat,
}: {
  issues: Issue[];
  issuesCat: Issue[];
}) {
  return (
    <Card padding="600">
      <BlockStack gap="300" align="center">
        <Text as="span" variant={"headingMd"}>
          Analyze result
        </Text>
        <Card roundedAbove="lg" padding="600">
          <IssueListChart
            chartData={issues}
            gradient={true}
            title="Number of issues per product"
          />
        </Card>
        <Card>
          <IssueListChart
            chartData={issuesCat}
            title="Number of issues in shop"
          />
        </Card>
      </BlockStack>
    </Card>
  );
}
