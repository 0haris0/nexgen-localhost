// ShopContext.js
import React, { createContext, useContext, useState } from "react";

// Create the context
const ShopContext = createContext();

// Custom hook to use the ShopContext
export const useShop = () => useContext(ShopContext);

// Provider component
export const ShopProvider = ({ children }) => {
  const [storeData, setStoreData] = useState({
    id: null,
    shopify_id: null,
  });
  const [subscriptionData, setSubscriptionData] = useState({
    name: null,
    credit: 0,
  });
  const [savedStoredData, setSavedStoredData] = useState(null);

  return (
    <ShopContext.Provider
      value={{
        storeData,
        setStoreData,
        subscriptionData,
        setSubscriptionData,
        savedStoredData,
        setSavedStoredData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
