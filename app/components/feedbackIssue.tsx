import { Badge, Tooltip } from "@shopify/polaris";

interface FeedbackIssueProps {
  IssuesNumber: number;
}

export const FeedbackIssue = ({ IssuesNumber }: FeedbackIssueProps) => {
  if (IssuesNumber > 10) {
    return (
      <Tooltip
        content={`There are ${IssuesNumber} critical issues with this product`}
      >
        <Badge tone="critical">{`${IssuesNumber}`}</Badge>
      </Tooltip>
    );
  }

  if (IssuesNumber >= 6) {
    return (
      <Tooltip
        content={`There are ${IssuesNumber} warning issues with this product`}
      >
        <Badge tone="warning">{`${IssuesNumber}`}</Badge>
      </Tooltip>
    );
  }

  if (IssuesNumber > 0 && IssuesNumber < 6) {
    const bgColor = `rgba(255, 193, 7, ${IssuesNumber / 5})`;
    return (
      <Tooltip
        content={`There are ${IssuesNumber} minor issues with this product`}
      >
        <div
          style={{
            backgroundColor: bgColor,
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <span>{IssuesNumber}</span>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip content="Product is fully optimized with no issues">
      <Badge tone="success">No Issues</Badge>
    </Tooltip>
  );
};
