import { IRequestMetaConfig } from "./requestActionCreators";
import { Action } from "redux";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export interface IRequestCallbacks<TResp> {
  success?: (action: IRequestSuccessAction<TResp>) => void;
  failed?: (action: IRequestFailedAction) => void;
}

export interface IRequestActionCreator<TReq, TResp = any, TMeta = any, TPayload = any> {
  (args: TReq, extraMeta?: TMeta, extraPayload?: TPayload): IRequestAction;

  TReq: TReq;
  TResp: TResp;
  $name: string;
  toString: () => string;
  start: {
    toString: () => string;
  };
  success: {
    toString: () => string;
  };
  failed: {
    toString: () => string;
  };
}

export interface IRequestMeta extends IRequestMetaConfig {
  request: true;
}

export interface IRequestAction extends Action {
  meta: IRequestMeta;
  payload: AxiosRequestConfig;
}

export interface IRequestSuccessAction<TResp = any> extends Action {
  payload: AxiosResponse<TResp>;
  meta: {
    previousAction: IRequestAction;
  };
}

export interface IRequestFailedAction extends Action {
  error: true;
  payload: AxiosError;
  meta: {
    previousAction: IRequestAction;
  };
}
