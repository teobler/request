import { assign, omit, set } from "lodash";
import { AnyAction, combineReducers } from "redux";
import { IUpdateTempDataAction, removeTempData, updateTempData } from "../../../actions";

const mockTempDataReducer = (state: any = {}, action: IUpdateTempDataAction<any>) => {
  if (action.type === `${updateTempData}` && action.meta && action.payload) {
    return {
      ...state,
      [action.meta.groupKey]: action.payload.data,
    };
  }
  if (action.type === `${removeTempData}` && action.meta) {
    return omit(state, action.meta.groupKey);
  }
  return state;
};

const mockUpdateStoreStateAction = <TData>({ data, keyPath }: { data: TData; keyPath: string }) => {
  const type = "@@store/updateStoreState";
  assign(mockUpdateStoreStateAction, { toString: () => type });
  return {
    type,
    meta: {
      keyPath,
    },
    payload: {
      data,
    },
  };
};

const mockStoreStateReducer = (state: any = { test: "hi,store" }, action: AnyAction) => {
  if (action.type === `${mockUpdateStoreStateAction}` && action.meta && action.payload) {
    set(state, action.meta.keyPath, action.payload.data);
    return {
      ...state,
    };
  }
  return state;
};

export const mockRootReducer = combineReducers({
  tempData: mockTempDataReducer,
  root: mockStoreStateReducer,
});
