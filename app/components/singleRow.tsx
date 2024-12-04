import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  IndexTable,
  InlineStack,
  Text,
  Thumbnail,
  Collapsible,
  List,
  Card,
  Badge,
  Icon,
  Divider,
  BlockStack,
  Tag,
} from "@shopify/polaris";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon,
} from "@shopify/polaris-icons";

import { FeedbackIssue } from "./feedbackIssue.tsx";

export default function SingleRow(props) {
  const {
    id,
    title,
    feedback,
    feedback_issues,
    featured_image,
    tags,
    shopify_id,
    ai_correction,
  } = props.product;
  const [open, setOpen] = useState(false);

  // Function to toggle the collapsible row
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  // Function to handle severity levels and return the correct Badge tone
  const handleSeverity = (severity) => {
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
              width={45}
              alt={title}
              source={featured_image.url || XCircleIcon}
            />
            <BlockStack gap="100">
              <Text as="b" alignment="center">
                {title.length > 75 ? title.slice(0, 75) + "..." : title}
              </Text>
              <InlineStack gap="100">
                {tags.map((tag, key) => {
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
                <Text alignment="end" fontWeight="bold">
                  {FeedbackIssue(feedback_issues)}
                </Text>
                <Text>{open ? "Hide issues" : "Display issues"}</Text>
                <Icon source={open ? ArrowUpIcon : ArrowDownIcon} />
              </InlineStack>
            </Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>

      {/* Full-width expandable row with improved design */}
      <IndexTable.Row
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
            <Card sectioned subdued>
              <BlockStack gap="150">
                <InlineStack
                  gap="small"
                  blockAlign="stretch"
                  align={"space-between"}
                >
                  <Text variant="headingMd">Issues Details</Text>
                  <Text variant="headingMd">Issues Severity</Text>
                </InlineStack>
                <Divider borderWidth={"025"} borderColor={"border-brand"} />

                <List
                  type="bullet"
                  spacing="tight"
                  style={{ marginTop: "12px" }}
                >
                  {feedback.map((issue, key) => (
                    <List.Item key={key}>
                      <InlineStack align={"space-between"}>
                        <Text
                          variant="headingSm"
                          style={{
                            marginLeft: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          {issue.issue}
                        </Text>
                        <Badge
                          tone={handleSeverity(issue.severity)}
                          size={"small"}
                          progress="complete"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                      </InlineStack>
                      <Text
                        variant="bodyMd"
                        style={{
                          marginLeft: "20px",
                          display: "block",
                          color: "#5c5f62",
                        }}
                      >
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
