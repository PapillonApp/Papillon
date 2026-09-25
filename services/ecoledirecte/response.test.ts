import { describe, expect, it } from "@jest/globals";

import { getResponseArray, requireResponseArray } from "@/services/ecoledirecte/response";

describe("EcoleDirecte response arrays", () => {
  it("unwraps a nested response and ignores null list entries", () => {
    expect(getResponseArray<{ id: number }>({ data: { result: { cours: [{ id: 1 }, null] } } }, ["cours", "data", "result"]))
      .toEqual([{ id: 1 }]);
  });

  it("keeps a valid empty response distinct from a malformed object", () => {
    expect(requireResponseArray({ data: { result: [] } }, ["data", "result"], "timetable")).toEqual([]);
    expect(() => requireResponseArray({ data: { result: {} } }, ["data", "result"], "timetable"))
      .toThrow("timetable did not contain an array response");
  });

  it("handles circular wrapper objects without recursing forever", () => {
    const response: { data?: unknown } = {};
    response.data = response;
    expect(() => requireResponseArray(response, ["data", "result"], "grades")).toThrow(TypeError);
  });
});
