import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Divider,
  InlineStack,
  List,
  Text,
  Tooltip,
} from "@shopify/polaris";

export default function ProductCard({
  product,
  removeSelectedProduct,
  shopUrl: string,
}) {
  return (
    <Box
      key={product.id}
      background={"bg-surface"}
      borderColor={"border-brand"}
      borderWidth={"025"}
      padding="300"
      borderRadius="400"
      paddingBlock="400"
      insetBlockEnd="400"
    >
      <BlockStack align="center" gap="150">
        <Text variant="headingMd">{product.title}</Text>
        <InlineStack>
          {product.tags.map((tag, index) => (
            <Badge key={index}>{tag}</Badge>
          ))}
        </InlineStack>
        <List gap="extraTight">
          {product.feedback.map((value, index) => (
            <List.Item key={index}>
              {value.message} {value.title}
            </List.Item>
          ))}
        </List>
        <Divider borderWidth={"025"} borderColor={"border-brand"} />
        <ButtonGroup>
          <Tooltip content="Remove from list for AI product enhancement">
            <Button
              onClick={() => removeSelectedProduct(product.id)}
              variant="secondary"
              tone="critical"
            >
              Remove product
            </Button>
          </Tooltip>
          <Tooltip content="Open site for editing product">
            <Button
              url={`${shopUrl}/admin/products/${product.shopify_id?.split("/").pop()}`}
              target="_blank"
              variant="secondary"
            >
              Open product
            </Button>
          </Tooltip>
        </ButtonGroup>
      </BlockStack>
    </Box>
  );
}
