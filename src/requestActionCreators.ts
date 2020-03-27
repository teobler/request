import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { assign, endsWith, get, isUndefined, merge } from "lodash";
import { Action, AnyAction } from "redux";
import { IRequestAction, IRequestFailedAction, IRequestMeta, IRequestSuccessAction } from "./types";

interface IRequestStartAction extends Action {
  meta: {
    previousAction: IRequestAction;
  };
}

interface IToString {
  toString: () => string;
}

interface IRequestHelpers extends IToString {
  start: IToString;
  success: IToString;
  failed: IToString;
}

const createStartActionType = (type: string) => `${type}_Start`;
const createSuccessActionType = (type: string) => `${type}_Success`;
const createFailedActionType = (type: string) => `${type}_Failed`;

const createRequestActionHelpers = (actionType: string): IRequestHelpers => {
  return {
    toString: () => actionType,
    start: {
      toString: () => createStartActionType(actionType),
    },
    success: {
      toString: () => createSuccessActionType(actionType),
    },
    failed: {
      toString: () => createFailedActionType(actionType),
    },
  };
};

export interface IRequestMetaConfig {
  uuid?: string;
  shouldShowLoading?: boolean;
  omitError?: boolean;
}

const getMetaData = (requestMetaConfig?: IRequestMetaConfig) => {
  const metaData: IRequestMeta = {
    request: true,
    ...requestMetaConfig,
  };

  if (requestMetaConfig && !isUndefined(requestMetaConfig.shouldShowLoading)) {
    metaData.shouldShowLoading = get(requestMetaConfig, "shouldShowLoading", false);
  }

  if (requestMetaConfig && !isUndefined(requestMetaConfig.omitError)) {
    metaData.omitError = get(requestMetaConfig, "omitError", false);
  }

  return metaData;
};

export function createRequestAction<TReq, TResp = any, TMeta = any, TPayload = any>(
  type: string,
  reqConfigCreator: (req: TReq) => AxiosRequestConfig,
  requestMetaConfig?: IRequestMetaConfig,
) {
  const actionCreator = (req?: TReq, meta?: TMeta, extraPayload?: TPayload): IRequestAction => {
    return {
      type,
      meta: merge({}, meta, getMetaData(requestMetaConfig)),
      payload: {
        ...reqConfigCreator(req || ({} as TReq)),
        ...(extraPayload || ({} as any)),
      },
    };
  };
  return assign(actionCreator, {
    ...createRequestActionHelpers(type),
    $name: type,
    TReq: {} as TReq,
    TResp: {} as TResp,
  });
}

export const createRequestStartAction = (action: IRequestAction): IRequestStartAction => {
  return {
    type: createStartActionType(action.type),
    meta: {
      previousAction: action,
    },
  };
};

export const createRequestSuccessAction = (action: IRequestAction, response: AxiosResponse): IRequestSuccessAction => {
  return {
    type: createSuccessActionType(action.type),
    payload: response,
    meta: {
      previousAction: action,
    },
  };
};

export const createRequestFailedAction = (action: IRequestAction, error: AxiosError): IRequestFailedAction => {
  return {
    type: createFailedActionType(action.type),
    error: true,
    payload: error,
    meta: {
      previousAction: action,
    },
  };
};

export const isRequestAction = (action: IRequestAction) => action.meta && action.meta.request;

const creator = (condition: boolean) => {
  return (action: AnyAction) => {
    return get(action.meta, "previousAction.meta.request") && condition;
  };
};

export const isRequestFailedAction = (action: AnyAction): action is IRequestFailedAction =>
  creator(endsWith(action.type, "_Failed"))(action);
export const isRequestSuccessAction = (action: AnyAction): action is IRequestSuccessAction =>
  creator(endsWith(action.type, "_Success"))(action);
export const isRequestStartAction = (action: AnyAction): action is IRequestStartAction =>
  creator(endsWith(action.type, "_Start"))(action);
