import { StoreContext } from "../../hooks/useDispatch";
import React from "react";

export const getWrapper = (store: any) => ({ children }: any) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
