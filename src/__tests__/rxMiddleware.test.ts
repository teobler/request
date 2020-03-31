import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { MiddlewareTestHelper } from "./utils/MiddlewareTestHelper";
import { createRxMiddleware } from "../rxMiddleware";

describe("createRxMiddleware", () => {
  it("handle dispatch Subject", () => {
    const { invoke$ } = MiddlewareTestHelper.of(createRxMiddleware()).create();
    const sub$ = new Subject();
    sub$.subscribe();
    expect(invoke$(sub$)).toBeInstanceOf(Subscription);
  });

  it("should register action to root subject", () => {
    const { next, invoke$ } = MiddlewareTestHelper.of(createRxMiddleware()).create();
    invoke$({
      type: "SOME_ACTION",
      payload: {},
    });
    expect(next).toBeCalled();
  });
});
