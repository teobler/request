import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  createRequestAction,
  createRequestFailedAction,
  createRequestStartAction,
  createRequestSuccessAction, isRequestAction,
  isRequestFailedAction,
  isRequestStartAction,
  isRequestSuccessAction,
} from "../requestActionCreators";
import { IRequestAction } from "../types";

describe("requestActionCreators", () => {
  describe("createRequestAction", () => {
    const requestMapper = ({ name, age }: { name: string; age: number }) =>
      ({
        method: "GET",
        url: "/mock-api",
        data: {
          name,
          age,
        },
      } as AxiosRequestConfig);

    it("should create different type of request actions", () => {
      const requestActionCreator = createRequestAction("REQUEST_ACTION", requestMapper);
      const requestAction = requestActionCreator({ name: "TW", age: 20 });

      const expectedResult = {
        type: "REQUEST_ACTION",
        payload: {
          method: "GET",
          url: "/mock-api",
          data: {
            name: "TW",
            age: 20,
          },
        },
        meta: {
          request: true,
        },
      };

      expect(requestAction).toEqual(expectedResult);
      expect(requestActionCreator.toString()).toEqual("REQUEST_ACTION");
      expect(requestActionCreator.start.toString()).toEqual("REQUEST_ACTION_Start");
      expect(requestActionCreator.success.toString()).toEqual("REQUEST_ACTION_Success");
      expect(requestActionCreator.failed.toString()).toEqual("REQUEST_ACTION_Failed");
    });

    it("should create request action with loading and omit error configuration", () => {
      const metaData = {
        shouldShowLoading: true,
        omitError: true,
      };
      const requestActionCreator = createRequestAction("REQUEST_ACTION", requestMapper, metaData);
      const requestAction = requestActionCreator({ name: "TW", age: 20 });

      const expectedResult = {
        type: "REQUEST_ACTION",
        payload: {
          method: "GET",
          url: "/mock-api",
          data: {
            name: "TW",
            age: 20,
          },
        },
        meta: {
          omitError: true,
          request: true,
          shouldShowLoading: true,
        },
      };

      expect(requestAction).toEqual(expectedResult);
    });
  });

  describe("request action checkers", () => {
    const previousAction = { type: "balabala", meta: { request: true }, payload: {name: "name", age: 20} };
    const mockActionCreator = (type: string) => ({ type, meta: { previousAction, request: true } });

    it("should return true given an action is request action", () => {
      expect(isRequestAction(previousAction as IRequestAction)).toBeTruthy();
    });

    it("should return true given an action is request failed action", () => {
      expect(isRequestFailedAction(mockActionCreator("balabala_Failed"))).toBeTruthy();
    });

    it("should return true given an action is request success action", () => {
      expect(isRequestSuccessAction(mockActionCreator("balabala_Success"))).toBeTruthy();
    });

    it("should return true given an action is request start action", () => {
      expect(isRequestStartAction(mockActionCreator("balabala_Start"))).toBeTruthy();
    });
  });

  describe("create request staged action creators", () => {
    const requestAction = {
      type: "balabala",
      meta: {
        request: true,
      },
      payload: {
        method: "GET",
        url: "/mock-api",
        data: {
          name: "TW",
          age: 20,
        },
      },
    };

    it("should return request start action given a request action", () => {
      expect(createRequestStartAction(requestAction as IRequestAction)).toEqual({
        meta: {
          previousAction: {
            meta: {
              request: true,
            },
            payload: {
              data: {
                age: 20,
                name: "TW",
              },
              method: "GET",
              url: "/mock-api",
            },
            type: "balabala",
          },
        },
        type: "balabala_Start",
      });
    });

    it("should return request success action given a request action", () => {
      const mockResponse: AxiosResponse = {
        status: 200,
        statusText: "OK",
        headers: "headers",
        data: "data",
        config: {
          method: "GET",
          url: "/mock-api",
          data: {
            name: "name",
            age: "20",
          },
        },
      };

      expect(createRequestSuccessAction(requestAction as IRequestAction, mockResponse)).toEqual({
        meta: {
          previousAction: {
            meta: {
              request: true,
            },
            payload: {
              data: {
                age: 20,
                name: "TW",
              },
              method: "GET",
              url: "/mock-api",
            },
            type: "balabala",
          },
        },
        payload: {
          config: {
            data: {
              age: "20",
              name: "name",
            },
            method: "GET",
            url: "/mock-api",
          },
          data: "data",
          headers: "headers",
          status: 200,
          statusText: "OK",
        },
        type: "balabala_Success",
      });
    });

    it("should return request failed action given a request action", () => {
      const error: AxiosError = {
        message: "message",
        name: "name",
        config: {
          method: "GET",
          url: "/mock-api",
          data: {
            name: "name",
            age: "20",
          },
        },
        isAxiosError: false,
        toJSON: () => ({}),
      };

      expect(createRequestFailedAction(requestAction as IRequestAction, error)).toEqual({
        type: "balabala_Failed",
        error: true,
        payload: error,
        meta: {
          previousAction: {
            type: "balabala",
            meta: {
              request: true,
            },
            payload: {
              method: "GET",
              url: "/mock-api",
              data: {
                name: "TW",
                age: 20,
              },
            },
          },
        },
      });
    });
  });
});
