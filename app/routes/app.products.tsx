// Converted to TypeScript
import {useCallback, useEffect, useMemo, useState} from 'react';
import {authenticate} from '../shopify.server.js';
import {
  BlockStack,
  Button,
  Card,
  EmptyState,
  IndexFilters,
  IndexTable,
  Layout,
  Modal,
  Page,
  Text,
  Tooltip,
  useIndexResourceState,
  useSetIndexFiltersMode
} from '@shopify/polaris';
import {useFetcher, useLoaderData, useNavigate, useSearchParams} from '@remix-run/react';
import SingleRow from '../components/singleRow.js';
import {countIssues, getProductsById, getProductsByShopId, updateAiCorrection} from '../models/products.js';
import ProductCard from '../components/productCard.js';
import {AutomationFilledIcon} from '@shopify/polaris-icons';
import {useShop} from '../utils/ShopContext.js';
import {handleErrorResponse} from '../utils/errorHandler.js';
import {fetchShopQuery} from '../utils/shopData.js';
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";

// Loader function
export const loader = async ({request}: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);

  try {
    const storeData = await fetchShopQuery(admin);
    if (!storeData) {
      throw new Error('No data returned from the GraphQL API.');
    }
    const shopIdDB = storeData.shop.id;
    const url = new URL(request.url);
    const options = {
      page: parseInt(url.searchParams.get('page')) || 1,
      display: parseInt(url.searchParams.get('display')) || 25,
      order_by: url.searchParams.get('order_by') || 'feedback_issues',
      sort: url.searchParams.get('sort') || 'desc',
      selected: parseInt(url.searchParams.get('selected')) || 0,
      searchTerm: url.searchParams.get('searchTerm') || null,
    };

    const {
      result,
      totalCount,
    } = await getProductsByShopId({shop_id : shopIdDB, options : options});

    const issueCountSelection = (await countIssues(shopIdDB)).map(
      (item) => item.feedback_issues,
    );

    return {
      data: result,
      shop: storeData.shop,
      count: totalCount,
      issueDropDown: issueCountSelection,
      options: options,
    };
  } catch (error) {
    console.error('Error loading products or issues:', error.message);
    return handleErrorResponse('Error loading products or issues:', error.message);
  }
};

// Action function
export const action = async ({request}: ActionFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const formData = await request.formData();
  const productIds = formData.get('selectedResources')?.split(',').map((id) => parseInt(id.trim()));

  try {
    await updateAiCorrection(productIds, true);
    const selected = await getProductsById(productIds);
    return selected ? {selectedProduct: {selected}} : null;
  } catch (error) {
    console.error('Error updating')
    return handleErrorResponse('Error updating AI corrections', error.message);
  }
};

// Main Component
export function AppProducts() {
  const {
    data,
    shop,
    count,
    error,
    options,
  } = useLoaderData();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const {
    selectedResources,
    handleSelectionChange,
  } =
    useIndexResourceState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page')) || 1,
  );

  const [selected, setSelected] = useState(0);
  const [display, setDisplay] = useState(25);
  const [orderBy, setOrderBy] = useState('feedback_issues');
  const [sort, setSort] = useState('desc');

  const [sortSelected, setSortSelected] = useState(['feedback_issues desc']);
  const {
    mode,
    setMode,
  } = useSetIndexFiltersMode();

  const [itemStrings, setItemStrings] = useState([
    'All',
    'Selected products',

  ]);
  const [loadingTable, setLoadingTable] = useState(false);
  const navigate = useNavigate();
  const {storeData} = useShop();
  //console.warn(storeData);
  const primaryAction =
    selected === 0
      ? {
        type: 'save-as',
        onAction: () => {
        },
        disabled: true,
        loading: false,
      }
      : {
        type: 'save',
        onAction: () => {
        },
        disabled: true,
        loading: false,
      };

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setLoadingTable(false);
    } else if (fetcher.state === 'loading' || fetcher.state === 'submitting') {
      setLoadingTable(true);
    }
  }, [fetcher.state, data]);

  useEffect(() => {
    // Use fetcher.load instead of submit to refresh data based on URL params
    const params = new URLSearchParams({
      page: currentPage,
      display: display,
      order_by: orderBy,
      sort: sort,
      searchTerm,
      selected: selected,
    });

    setLoadingTable(true);
    fetcher.load(`/?${params.toString()}`);
  }, [currentPage, display, orderBy, selected, sortSelected, searchTerm]);

  const selectedData = useMemo(
    () =>
      data
        ? data.filter((product) => selectedResources.includes(product.id))
        : [],
    [selectedResources, data],
  );

  // Function to handle search input change and update URL params
  const handleSearchChange = (newTerm) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      searchTerm: newTerm,
      page: '1',
    });
    setSearchTerm(newTerm);
  };

  // Function to handle sort change and update URL params
  const handleSortChange = (newSort) => {
    let newSortSplit = newSort[0].split(' ');
    let order_by = newSortSplit[0];
    let sort = newSortSplit[1];
    setSearchParams({
      ...Object.fromEntries(searchParams),
      order_by: order_by,
      sort: sort,
      page: '1',
    });
    setSortSelected(newSort);
  };

  const handlePageChange = (nextPage) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: nextPage,
    });
    setCurrentPage(nextPage);
  };

  const handleTabSelectionChange = (selected) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      selected: selected,
      page: '1',
    });
  };

  const sortOptions = [
    {
      label: 'Title',
      value: 'title asc',
      directionLabel: 'Ascending',
    },
    {
      label: 'Title',
      value: 'title desc',
      directionLabel: 'Descending',
    },
    {
      label: 'No. Issues',
      value: 'feedback_issues asc',
      directionLabel: 'Ascending',
    },
    {
      label: 'No. Issues',
      value: 'feedback_issues desc',
      directionLabel: 'Descending',
    },
    {
      label: 'Date',
      value: 'date_created asc',
      directionLabel: 'Ascending',
    },
    {
      label: 'Date',
      value: 'date_created desc',
      directionLabel: 'Descending',
    },
  ];
  const appliedFilters = [];
  const onCreateNewView = async (value) => {
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };
  const [accountStatus, setAccountStatus] = useState(undefined);

  const [taggedWith, setTaggedWith] = useState('');
  const [moneySpent, setMoneySpent] = useState(0);

  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );
  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    [],
  );

  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    [],
  );

  const filters = [
    /*
    {
      key: "test",
      label: "test",
    },
    {
      key: "accountStatus",
      label: "Account status",
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            {
              label: "Enabled",
              value: "enabled",
            },
            {
              label: "Not invited",
              value: "not invited",
            },
            {
              label: "Invited",
              value: "invited",
            },
            {
              label: "Declined",
              value: "declined",
            },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "moneySpent",
      label: "Money spent",
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },*/
  ];
  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {
      handleTabSelectionChange(index);
    },
    id: `${item}-${index}`,
    isLocked: index === 0,

    /*
    actions:
      index === 0
        ? []
        : [
            {
              type: "rename",
              onAction: () => {},
              onPrimaryAction: async (value) => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                setItemStrings(newItemsStrings);
                return true;
              },
            },
          ]
            {
              type: "duplicate",
              onPrimaryAction: async (value) => {
                return true;
              },
            },
            {
              type: "edit",
            },
            {
              type: "delete",
              onPrimaryAction: async () => {
                return true;
              },
            },
          ],*/
  }));
  const onHandleCancel = () => {
  };
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    [],
  );
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    [],
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);

  const handleQueryValueRemove = useCallback(() => setSearchTerm(''), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);
  return (
    <Page
      title="Products"
      fullWidth
      primaryAction={
        <Tooltip content="Check AI enhancement and approve/decline it">
          {selected === 2 ? null : selected === 0 ? (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              disabled={!error && selectedResources.length === 0 || !data}
              aria-label="Save selected products for AI enhancement"
            >
              Save products
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                navigate('/app/regenerate/');
              }}
              disabled={!error && selectedResources.length === 0 || !data}
              icon={AutomationFilledIcon}
            >
              Product optimisation
            </Button>
          )}
        </Tooltip>
      }
    >
      <Layout>
        <Modal
          title="Enhance selected product"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          primaryAction={{
            content: 'Enhance selected product',
            onAction: () => {
              setIsModalOpen(false);
              const formData = new FormData();
              formData.append('selectedResources', selectedResources.join(','));
              fetcher.submit(formData, {method: 'POST'});
            },
          }}
        >
          <Modal.Section>
            <Text variant="bodyLg" fontWeight="bold">
              Are you sure you want to enhance these products with AI?
            </Text>
          </Modal.Section>
        </Modal>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="300">
              <IndexFilters
                sortOptions={sortOptions}
                sortSelected={sortSelected}
                queryValue={searchTerm}
                queryPlaceholder="Searching in all"
                onQueryChange={handleSearchChange}
                onQueryClear={() => setSearchTerm('')}
                onSort={(value) => handleSortChange(value)}
                primaryAction={{
                  type: 'save',
                  onAction: () => {
                  },
                  disabled: true,
                  loadingTable: false,
                }}
                cancelAction={{
                  onAction: onHandleCancel,
                  disabled: true,
                  loading: false,
                }}
                tabs={tabs}
                loading={loadingTable}
                selected={selected}
                onSelect={setSelected}
                canCreateNewView={false}
                onCreateNewView={onCreateNewView}
                onClearAll={handleFiltersClearAll}
                filters={filters}
                mode={mode}
                setMode={setMode}
              />

              <IndexTable
                resourceName={{
                  singular: 'Product',
                  plural: 'Products',
                }}
                selectable
                onSelectionChange={handleSelectionChange}
                headings={[{title: 'Title'}, {title: 'Issues'}]}
                selectedItemsCount={selectedResources.length || 0}
                itemCount={data ? data.length : 0}
                loading={loadingTable}
                pagination={{
                  hasNext: currentPage < Math.ceil(count / display),
                  hasPrevious: currentPage > 1,
                  onPrevious: () => handlePageChange(currentPage - 1),
                  onNext: () => handlePageChange(currentPage + 1),
                }}
              >
                {data && data.length > 0 && data.map((product) => (
                  <SingleRow
                    product={product}
                    key={product.id}
                    selectedResources={selectedResources}
                  />
                ))}
              </IndexTable>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant={'oneThird'}>
          <Card title="Selected Products">
            <BlockStack gap="250" align={'center'}>
              {selectedData && selectedData.length > 0 ? (
                selectedData.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    shopUrl={shop?.shop_url}
                    removeSelectedProduct={(id) =>
                      handleSelectionChange(
                        selectedResources.filter((resId) => resId !== id),
                      )
                    }
                  />
                ))
              ) : (
                <EmptyState
                  heading="Manage your inventory"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Please select products to enhance by AI.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
