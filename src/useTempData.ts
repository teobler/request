import { DependencyList, useEffect, useMemo, useRef } from "react";
import { AnyAction, Reducer } from "redux";
import { updateTempData } from "./actions";
import { RequestStage, useRequest } from "./useRequest";
import { IRequestActionCreator, IRequestSuccessAction } from "./types";
import { useDispatch } from "./hooks/useDispatch";
import { useSelector } from "./hooks/useSelector";
import { useObservable } from "./hooks/useObservable";

const defaultReducer = <TResp>(_: any, action: IRequestSuccessAction<TResp>) => action.payload.data;

export const useTempData = <T extends IRequestActionCreator<T["TReq"], T["TResp"]>>(
  actionCreator: T,
  args?: T["TReq"],
  deps: DependencyList = [],
  scope?: string,
  reducer?: Reducer,
) => {
  const groupName = scope ? `${scope}${actionCreator.$name}` : actionCreator.$name;
  const dispatch = useDispatch();
  const data = useSelector((state) => state.tempData[groupName]);
  const dataRef = useRef(null);
  dataRef.current = data;

  const { updateData } = useMemo(
    () => ({
      updateData: <TAction extends AnyAction>(action: TAction) => (reducer: Reducer<any, TAction>) =>
        dispatch(updateTempData(groupName, reducer(dataRef.current, action))),
    }),
    [],
  );
  const [fetchData, requestStage$] = useRequest(actionCreator, {
    success: (action) => {
      const updateDataReducer = reducer || defaultReducer;
      updateData(action)(updateDataReducer);
    },
  });

  const requestStage = useObservable(requestStage$) as RequestStage;

  useEffect(() => {
    fetchData(args as any);
  }, deps);

  useEffect(
    () => () => {
      dispatch(updateTempData(groupName, undefined));
    },
    [],
  );

  return [data, requestStage, fetchData, updateData] as [
    typeof actionCreator["TResp"],
    typeof requestStage,
    typeof fetchData,
    typeof updateData,
  ];
};
