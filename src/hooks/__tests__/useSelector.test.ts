import { renderHook } from "@testing-library/react-hooks";
import { useSelector } from "../useSelector";
import { createStore } from "redux";
import { getWrapper } from "../../__tests__/utils/getWarpper";
import { mockRootReducer } from "./utils/mockRootReducer";

describe("useSelector", () => {
  let store: any;
  let wrapper: any;

  beforeEach(() => {
    store = createStore(mockRootReducer);
    wrapper = getWrapper(store);
  });

  it("should select whole initial state", () => {
    const expectedInitialState = { tempData: {}, root: { test: "hi,store" } };

    const { result } = renderHook(() => useSelector((state) => state), { wrapper });

    expect(result.current).toEqual(expectedInitialState);
  });

  it("should select tempData from initial state", () => {
    const expectedTempData = {};

    const { result } = renderHook(() => useSelector((state) => state.tempData), { wrapper });

    expect(result.current).toEqual(expectedTempData);
  });
});
