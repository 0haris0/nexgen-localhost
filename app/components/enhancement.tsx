import React, { useCallback, useState } from "react";
import {
  Box,
  IndexTable,
  InlineStack,
  Tag,
  Text,
  TextField,
} from "@shopify/polaris";

export const Enhancement = (props) => {
  const {
    category,
    oldValue = "N/A",
    newValue = "Pending update",
    product,
  } = props;

  const [newTitle, setNewTitle] = useState(newValue);
  const [tagValue, setTagValue] = useState("");
  const [tagArrayValue, setTagArrayValue] = useState([...product.tags]);
  const [suggestion, setSuggestion] = useState("");

  const updateSelection = useCallback(
    (selected) => {
      const nextSelectedTags = new Set([...tagArrayValue]);

      if (nextSelectedTags.has(selected)) {
        nextSelectedTags.delete(selected);
      } else {
        nextSelectedTags.add(selected);
      }
      setTagArrayValue([...nextSelectedTags]);
      setTagValue("");
    },
    [tagArrayValue],
  );

  const removeTag = useCallback((tag) => {
    setTagArrayValue((prevTags) => prevTags.filter((t) => t !== tag));
  }, []);
  const verticalContentMarkup =
    tagArrayValue.length > 0 ? (
      <InlineStack gap={"100"} spacing={"extraTight"} alignment="center">
        {tagArrayValue.map((tag) => (
          <Tag key={`option-${tag}`} onRemove={() => removeTag(tag)}>
            {tag}
          </Tag>
        ))}
      </InlineStack>
    ) : null;

  return (
    <IndexTable
      headings={[
        {
          title: "",
          id: "description",
        },
        { title: "Original products" },
        { title: "Enhanced product" },
      ]}
      itemCount={100}
      resourceName={{
        singular: "Product",
        plural: "Products",
      }}
      selectable={false}
    >
      {/*
          <IndexTable.Row id={"header"} position={0} rowType={"subheader"}>
            <IndexTable.Cell
              as={"th"}
              headers={""}
              id={"description"}
            ></IndexTable.Cell>
            <IndexTable.Cell
              as={"th"}
              headers={"Original products"}
              scope={"col"}
            >
              Test 1
            </IndexTable.Cell>
            <IndexTable.Cell>Test</IndexTable.Cell>
          </IndexTable.Row>*/}

      <IndexTable.Row id={"title"} rowType={"data"} position={0}>
        <IndexTable.Cell colSpan={1}>
          <Text variant={"bodyMd"}>Title</Text>
          <Text variant={"bodyXs"} tone={"text-inverse"}>
            Title of product
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell scope={"col"}>
          <TextField
            variant={"borderless"}
            label={"Title"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            value={product.title || "N/A"}
            disabled
            labelHidden
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"New Title"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            disabled
            labelHidden
            value={product.newTitle || ""}
            onChange={(value) => setNewTitle(value)}
          />
        </IndexTable.Cell>
      </IndexTable.Row>

      <IndexTable.Row id={"description"} rowType={"data"} position={1}>
        <IndexTable.Cell>
          <Text variant={"bodyMd"}>Description</Text>
          <Text variant={"bodyXs"} tone={"text-inverse"}>
            Description of product
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"Description"}
            multiline={8}
            autoSize={false}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            value={product.description || "N/A"}
            disabled
            labelHidden
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"New Description"}
            readOnly
            connectedLeft
            multiline={8}
            connectedRight
            autoComplete="off"
            disabled
            labelHidden
            value={product.newDescription || ""}
            onChange={(value) => setNewTitle(value)}
          />
        </IndexTable.Cell>
      </IndexTable.Row>
      <IndexTable.Row id={"categoryName"} rowType={"data"} position={3}>
        <IndexTable.Cell>
          <Text variant={"bodyMd"}>Category</Text>
          <Text variant={"bodyXs"} tone={"text-inverse"}>
            Category of product of product
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"Category Name"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            value={product.category_name || "N/A"}
            disabled
            labelHidden
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"New Category name"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            disabled
            labelHidden
            value={product.newCategoryName || ""}
            onChange={(value) => setNewTitle(value)}
          />
        </IndexTable.Cell>
      </IndexTable.Row>
      <IndexTable.Row id={"tags"} rowType={"data"} position={4}>
        <IndexTable.Cell>
          <Text variant={"bodyMd"}>Tags</Text>
          <Text variant={"bodyXs"} tone={"text-inverse"}>
            Title of product
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell scope={"col"} colSpan={1}>
          <Box>
            {product.tags.length > 0 ? (
              product.tags.map((singleTag, key) => {
                if (key % 4 === 0) {
                }
                return (
                  <Tag
                    key={key}
                    disabled={true}
                    size={"small"}
                    onRemove={() => removeTag(singleTag)}
                  >
                    {singleTag || ""}
                  </Tag>
                );
              })
            ) : (
              <TextField
                variant={"borderless"}
                label={"Tags"}
                readOnly
                connectedLeft
                connectedRight
                autoComplete="off"
                value={product.tags.toString() || "N/A"}
                disabled
                labelHidden
              />
            )}
          </Box>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {product.newTags?.length > 0 ? (
            product.newTags.map((singleTag, key) => {
              return (
                <Tag key={key} onRemove={() => removeTag(singleTag)}>
                  {singleTag}
                </Tag>
              );
            })
          ) : (
            <TextField
              variant={"borderless"}
              label={"Tags"}
              readOnly
              connectedLeft
              connectedRight
              autoComplete="off"
              value=""
              disabled
              labelHidden
            />
          )}
        </IndexTable.Cell>
      </IndexTable.Row>

      <IndexTable.Row id={"seoDescription"} rowType={"data"} position={6}>
        <IndexTable.Cell>
          <Text variant={"bodyMd"}>SEO Description</Text>
          <Text variant={"bodyXs"} tone={"text-inverse"}>
            SEO Description
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"Seo Description"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            value={product.seo_description || "N/A"}
            disabled
            labelHidden
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"New SEO Description"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            disabled
            labelHidden
            value={product.newSeoDescription || ""}
            onChange={(value) => setNewTitle(value)}
          />
        </IndexTable.Cell>
      </IndexTable.Row>
      <IndexTable.Row id={"seoTitle"} rowType={"data"} position={5}>
        <IndexTable.Cell>
          <Text variant={"bodyMd"}>SEO title</Text>
          <Text variant={"bodyXs"} tone={"text-inverse"}>
            SEO title for product
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"SEO Title"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            value={product.seo_title || "N/A"}
            disabled
            labelHidden
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            variant={"borderless"}
            label={"New SEO Title"}
            readOnly
            connectedLeft
            connectedRight
            autoComplete="off"
            disabled
            labelHidden
            value={product.newSeoTitle || ""}
            onChange={(value) => setNewTitle(value)}
          />
        </IndexTable.Cell>
      </IndexTable.Row>
    </IndexTable>
  );
};
