import React, { useCallback, useState } from "react";
import {
  Badge,
  BlockStack,
  Box,
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
  Tooltip,
} from "@shopify/polaris";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  XCircleIcon,
} from "@shopify/polaris-icons";

import { FeedbackIssue } from "./feedbackIssue";
import type { product } from "@prisma/client";
import type { Tone } from "@shopify/polaris/build/ts/src/components/Badge";

interface SingleRowProps {
  product: Omit<product, "id"> & {
    id: number;
    title: string;
    feedback: Array<{
      issue: string;
      severity: string;
      message: string;
    }>;
    feedback_issues: number;
    featured_image: {
      url: string;
    };
    tags: Array<{
      tag: string;
      key: number;
    }>;
    ai_correction: boolean;
  };
  position: number;
  selectedResources: string[];
}

function ButtonWithContent(props: { open: boolean; feedback_issues: number }) {
  return (
    <InlineStack align="center" gap="200">
      <Box>
        <Text as="span" alignment="end" fontWeight="bold">
          <FeedbackIssue IssuesNumber={feedback_issues} />
        </Text>
        <Text as="span">{props.open ? "Hide issues" : "Display issues"}</Text>
        <Icon source={props.open ? ArrowUpIcon : ArrowDownIcon} />
      </Box>
    </InlineStack>
  );
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
  const handleSeverity = (severity: string): Tone => {
    switch (severity.toLowerCase()) {
      case "high":
        return "critical"; // Polaris' 'critical' tone for high severity
      case "medium":
        return "warning"; // Polaris' 'warning' tone for medium severity
      case "low":
        return "attention"; // 'attention' tone for low severity
      default:
        return "new"; // Default subdued tone if severity isn't specified
    }
  };
  let tableHeaders = [
    { title: "SEO Title", id: "seoTitle" },
    { title: "SEO Description", id: "seoDescription" },
    { title: "Image", id: "featuredMedia" },
    { title: "Title", id: "title" },
    { title: "Variants", id: "variants" },
    { title: "Channels", id: "publishedAt" },
    { title: "Tags", id: "tags" },
    { title: "Collections", id: "collections" },
    { title: "Type of product", id: "productType" },
    { title: "Vendor", id: "vendor" },
    { title: "Tracks Inventory", id: "tracksInventory" },
  ];
  return (
    <>
      {/* Main row with title and button */}
      <IndexTable.Row
        position={props.position}
        id={id.toString()}
        key={id}
        selected={props.selectedResources.includes(id.toString())}
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
                {title.length > 75 ? `${title.slice(0, 75)}...` : title}
              </Text>
              <InlineStack gap="100">
                {tags.map((singleTag) => (
                  <Tag key={singleTag.key} disabled={true}>
                    {singleTag.tag}
                  </Tag>
                ))}
              </InlineStack>
            </BlockStack>
          </InlineStack>
        </IndexTable.Cell>
        <IndexTable.Cell headers={"Number of issues"}>
          <Text as="span" alignment="center" fontWeight="bold">
            <FeedbackIssue IssuesNumber={feedback_issues} />
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell headers={"issues"} flush={true}>
          <IndexTable.Row
            position={2}
            rowType={"subheader"}
            id={"2"}
            selected={false}
            disabled={true}
            hideSelectable={true}
          >
            {feedback.map((value, key) => (
              <IndexTable.Cell
                scope={value.issue}
                key={key}
                id={key.toString()}
                as={"td"}
              >
                <Tooltip content={`${value.message}`}>
                  <Text as={"span"} variant={"bodySm"}>
                    {value.issue}
                  </Text>
                </Tooltip>
              </IndexTable.Cell>
            ))}
          </IndexTable.Row>
          <IndexTable.Row
            position={3}
            rowType={"data"}
            id={"3"}
            disabled={true}
            selected={false}
            hideSelectable={true}
          ></IndexTable.Row>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="400" wrap={false} blockAlign="center">
            {/* Button to toggle the collapsible content */}
            <Button
              as={"div"}
              border="base"
              padding="base"
              borderRadius={"200"}
              size="medium"
              variant="secondary"
              icon={open ? ArrowUpIcon : ArrowDownIcon}
              onClick={() => handleToggle}
            >
              {open ? "Hide issues" : "Display issues"}
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
        selected={false}
        hideSelectable={true}
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
                  {feedback.length > 0 ? (
                    feedback.map((issue, key) => (
                      <List.Item key={key}>
                        <InlineStack align={"space-between"}>
                          <Text variant="headingSm" as={"p"}>
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
                        <Text variant="bodyMd" as={"p"}>
                          {issue.message}
                        </Text>
                      </List.Item>
                    ))
                  ) : (
                    <Text as={"p"} variant={"headingSm"}>
                      No issues found
                    </Text>
                  )}
                </List>
              </BlockStack>
            </Card>
          </Collapsible>
        </IndexTable.Cell>
      </IndexTable.Row>
    </>
  );
}
