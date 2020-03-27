import { DependencyList, useEffect, useMemo, useRef } from "react";
import { BehaviorSubject, merge, Subject } from "rxjs";
import { isRequestFailedAction, isRequestSuccessAction } from "./requestActionCreators";
import { AnyAction } from "redux";
import { filter, tap } from "rxjs/operators";
import { useDispatch } from "./useDispatch";
import { isEqual } from "lodash";
import { IRequestActionCreator, IRequestCallbacks, IRequestFailedAction, IRequestSuccessAction } from "./types";

interface IUseRequestOptions<T> extends IRequestCallbacks<T> {
  ignorePayload?: boolean;
}

export enum RequestStage {
  INITIAL = "INITIAL",
  START = "START",
  SUCCESS = "SUCCESS",
  FAILED = "FAIL",
}

export const useRequest = <T extends IRequestActionCreator<T["TReq"], T["TResp"]>>(
  actionCreator: T,
  options: IUseRequestOptions<T["TResp"]> = {},
  deps: DependencyList = [],
) => {
  const dispatch = useDispatch();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const lastActionRef = useRef<AnyAction>();

  const { request, requestStage$ } = useMemo(() => {
    const requestStage$ = new BehaviorSubject(RequestStage.INITIAL);
    const request = <TMeta = any, TPayload = any>(
      args: T["TReq"],
      requestMetaConfig?: TMeta,
      extraPayload?: TPayload,
    ) => {
      requestStage$.next(RequestStage.START);
      const action = actionCreator(args, { ...requestMetaConfig }, extraPayload || {});
      lastActionRef.current = action;
      dispatch(action);
    };

    return {
      request,
      requestStage$,
    };
  }, deps);

  useEffect(() => {
    const subject$ = new Subject<AnyAction>();
    const subscription = dispatch<any>(subject$);

    const filterRequest = (requestSuccessAction: IRequestSuccessAction | IRequestFailedAction) =>
      !!lastActionRef.current &&
      requestSuccessAction.meta.previousAction.type === lastActionRef.current.type &&
      (optionsRef.current.ignorePayload ||
        isEqual(requestSuccessAction.meta.previousAction.payload, lastActionRef.current.payload));

    const sub = merge(
      subject$.pipe(
        filter(isRequestSuccessAction),
        filter(filterRequest),
        tap((requestSuccessAction) => {
          requestStage$.next(RequestStage.SUCCESS);
          optionsRef.current.success && optionsRef.current.success(requestSuccessAction as IRequestSuccessAction);
        }),
      ),
      subject$.pipe(
        filter(isRequestFailedAction),
        filter(filterRequest),
        tap((requestAction) => {
          requestStage$.next(RequestStage.FAILED);
          optionsRef.current.failed && optionsRef.current.failed(requestAction as IRequestFailedAction);
        }),
      ),
    ).subscribe();

    return () => {
      sub.unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  return [request, requestStage$] as [typeof request, BehaviorSubject<RequestStage>];
};
