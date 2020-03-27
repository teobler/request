import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { isUndefined, omitBy } from "lodash";
import { Dispatch, MiddlewareAPI } from "redux";
import Qs from "querystring";
import {
  createRequestFailedAction,
  createRequestStartAction,
  createRequestSuccessAction,
  isRequestAction,
} from "./requestActionCreators";

export const requestMiddleware = (axiosInstance: AxiosInstance) => {
  return ({ dispatch }: MiddlewareAPI) => {
    return (next: Dispatch) => {
      return (action: any) => {
        if (isRequestAction(action)) {
          dispatch(createRequestStartAction(action));

          // TODO: how to deal with auth
          const requestConfig = {
            ...action.payload,
            paramsSerializer: (params: any) => Qs.stringify(omitBy(params, isUndefined)),
            headers: {
              ...action.payload.headers,
            },
          };

          return axiosInstance
            .request(requestConfig)
            .then((response: AxiosResponse) => {
              return dispatch(createRequestSuccessAction(action, response));
            })
            .catch((error: AxiosError) => {
              return dispatch(createRequestFailedAction(action, error));
            });
        }
        return next(action);
      };
    };
  };
};
