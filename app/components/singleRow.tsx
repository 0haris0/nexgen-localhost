import React, { useCallback, useState } from "react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  Collapsible,
  Divider,
  Icon,
  IndexTable,
  InlineStack,
  List,
  Tag,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  XCircleIcon,
} from "@shopify/polaris-icons";

import { FeedbackIssue } from "./feedbackIssue";
import type { Product } from "../globals";

interface SingleRowProps {
  product: Product;
  position: number;
  selectedResources: string[];
}

export default function SingleRow(props: SingleRowProps) {
  const {
    id,
    title,
    feedback,
    feedback_issues,
    featured_image,
    tags,
    ai_correction,
  } = props.product;
  const [open, setOpen] = useState(false);

  // Function to toggle the collapsible row
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  // Function to handle severity levels and return the correct Badge tone
  const handleSeverity = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case "high":
        return "critical"; // Polaris' 'critical' tone for high severity
      case "medium":
        return "warning"; // Polaris' 'warning' tone for medium severity
      case "low":
        return "attention"; // 'attention' tone for low severity
      default:
        return "subdued"; // Default subdued tone if severity isn't specified
    }
  };
  return (
    <>
      {/* Main row with title and button */}
      <IndexTable.Row
        position={props.position}
        id={id}
        key={id}
        selected={props.selectedResources.includes(id)}
        onClick={handleToggle}
        disabled={ai_correction}
      >
        <IndexTable.Cell>
          <InlineStack gap="200" blockAlign="center" wrap={false} align="start">
            <Thumbnail
              size="extraSmall"
              alt={title}
              source={featured_image.url || XCircleIcon}
            />
            <BlockStack gap="100">
              <Text as="p" alignment="center">
                {title.length > 75 ? title.slice(0, 75) + "..." : title}
              </Text>
              <InlineStack gap="100">
                {tags.map((tag: string, key: number) => {
                  return (
                    <Tag key={key} disabled={true}>
                      {tag}
                    </Tag>
                  );
                })}
              </InlineStack>
            </BlockStack>
          </InlineStack>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <InlineStack gap="400" wrap={false} blockAlign="center">
            {/* Button to toggle the collapsible content */}
            <Button
              size="medium"
              variant="secondary"
              onClick={() => handleToggle}
            >
              <InlineStack align="center" gap="150">
                <Text as="span" alignment="end" fontWeight="bold">
                  <FeedbackIssue IssuesNumber={feedback_issues} />
                </Text>
                <Text as="span">{open ? "Hide issues" : "Display issues"}</Text>
                <Icon source={open ? ArrowUpIcon : ArrowDownIcon} />
              </InlineStack>
            </Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>

      {/* Full-width expandable row with improved design */}
      <IndexTable.Row
        id={`single-row-${id}`}
        rowType={"child"}
        disabled={true}
        position={0}
        selected={"indeterminate"}
      >
        <IndexTable.Cell colSpan={2}>
          <Collapsible
            open={open}
            id="collapsible-row"
            transition={{
              duration: "500ms",
              timingFunction: "ease-in-out",
            }}
          >
            <Card>
              <BlockStack gap="150">
                <InlineStack
                  gap="200"
                  blockAlign="stretch"
                  align={"space-between"}
                >
                  <Text as={"span"} variant="headingMd">
                    Issues Details
                  </Text>
                  <Text as={"span"} variant="headingMd">
                    Issues Severity
                  </Text>
                </InlineStack>
                <Divider borderWidth={"025"} borderColor={"border-brand"} />

                <List type="bullet" gap="extraTight">
                  {feedback.map((issue: any, key: number) => (
                    <List.Item key={key}>
                      <InlineStack align={"space-between"}>
                        <Text variant="headingSm" as={"p"}>
                          {issue.issue}
                        </Text>
                        <Badge
                          tone={handleSeverity(issue.severity) as Tone}
                          size={"small"}
                          progress="complete"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                      </InlineStack>
                      <Text variant="bodyMd" as={"p"}>
                        {issue.message}
                      </Text>
                    </List.Item>
                  ))}
                </List>
              </BlockStack>
            </Card>
          </Collapsible>
        </IndexTable.Cell>
      </IndexTable.Row>
    </>
  );
}
