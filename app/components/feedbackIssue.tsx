import React, { useEffect, useState } from 'react'
import { Tooltip, Badge } from '@shopify/polaris';

export const FeedbackIssue = (feedbackIssues) => {

  // Case: More than 10 issues - Critical (Danger Level)
  if (feedbackIssues > 10) {
    return (
      <Tooltip content={`There are ${feedbackIssues} critical issues with this product`}>
        <Badge tone="critical">{feedbackIssues}</Badge>
      </Tooltip>
    );
  }

  // Case: 6 to 10 issues - Warning (Warning Level)
  if (feedbackIssues >= 6) {
    return (
      <Tooltip content={`There are ${feedbackIssues} warning issues with this product`}>
        <Badge tone="warning">{feedbackIssues}</Badge>
      </Tooltip>
    );
  }

  // Case: 1 to 5 issues - Information (Gradation)
  if (feedbackIssues > 0 && feedbackIssues < 6) {
    const bgColor = `rgba(255, 193, 7, ${feedbackIssues / 5})`; // Yellowish warning color gradation
    return (
      <Tooltip content={`There are ${feedbackIssues} minor issues with this product`}>
        <div style={{ backgroundColor: bgColor, padding: '10px', borderRadius: '5px' }}>
          <span>{feedbackIssues}</span>
        </div>
      </Tooltip>
    );
  }

  // Case: No issues (Success Level)
  return (
    <Tooltip content="Product is fully optimized with no issues">
      <Badge tone="success">No Issues</Badge>
    </Tooltip>
  );
};

