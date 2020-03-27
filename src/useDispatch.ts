import React, { useContext } from "react";
import { Store } from "redux";

export const StoreContext = React.createContext({} as Store);

export const useDispatch = () => {
  const { dispatch } = useContext(StoreContext);

  if (!dispatch) {
    return () => {};
  }

  return dispatch;
};
