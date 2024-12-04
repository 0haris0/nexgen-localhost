import { Banner, Text } from "@shopify/polaris";

export default function ErrorBlock({ error, onDismiss }) {
  if (!error) {
    return null;
  }

  return (
    <Banner title={error.title} tone={error.tone} onDismiss={onDismiss}>
      <Text variant="bodyMd">{error.message}</Text>
    </Banner>
  );
}
