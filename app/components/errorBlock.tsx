import { Banner, Text } from "@shopify/polaris";

export default function ErrorBlock(props: {
  error: any;
  onDismiss: any;
  isVisible: any;
}) {
  const { error, onDismiss, isVisible } = props;
  if (!error) {
    return null;
  }

  return (
    <>
      {isVisible ? (
        <Banner title={error.title} tone={error.tone} onDismiss={onDismiss}>
          <Text as={"p"} variant="bodyMd">
            {error.message}
          </Text>
        </Banner>
      ) : null}
    </>
  );
}
