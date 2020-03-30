import { renderHook } from "@testing-library/react-hooks";
import { useDispatch } from "../useDispatch";
import { getWrapper } from "../../__tests__/utils/getWarpper";

describe("useDispatch", () => {
  it("should return dispatch function from store", () => {
    const mockDispatch = jest.fn();
    const store = {
      dispatch: mockDispatch,
      getState: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };
    const wrapper = getWrapper(store);
    const { result } = renderHook(() => useDispatch(), { wrapper });

    expect(result.current).toBe(mockDispatch);
  });

  it("should return empty function if there is no dispatch function in store", () => {
    const store = {
      getState: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    };
    const wrapper = getWrapper(store);
    const { result } = renderHook(() => useDispatch(), { wrapper });

    expect(result.current).toBeInstanceOf(Function);
  });
});
