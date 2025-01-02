// ShopContext.js
import React, { createContext, useContext, useState } from "react";

// Create the context
interface ShopContextType {
  storeMainData: Store;
  setStoreMainData: React.Dispatch<React.SetStateAction<Store>>;
}

const ShopContext = createContext<ShopContextType>({
  storeMainData: {} as Store,
  setStoreMainData: () => {},
});

// Custom hook to use the ShopContext
export const useShop = () => useContext(ShopContext);

// Provider component
import { ReactNode } from "react";
import type { Store } from "../globals";
import { ActiveSubscriptions } from "@shopify/shopify-api";
import { shops } from "@prisma/client";
interface ShopProviderProps {
  children: ReactNode;
}

export const ShopProvider = ({ children }: ShopProviderProps) => {
  const [storeMainData, setStoreMainData] = useState<Store>({
    productNumber: 0,
    shop: {} as shops,
    subscription: [] as unknown as ActiveSubscriptions,
    success: false,
  });
  return (
    <ShopContext.Provider
      value={{
        storeMainData,
        setStoreMainData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
