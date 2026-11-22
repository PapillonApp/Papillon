import { expect, test } from "@jest/globals";

import { PrepaLogin } from "./pendingPrepaLogin";
import { type ServiceAccount, Services } from "./types";

const makeService = (serviceId: Services): ServiceAccount => ({
  id: String(serviceId),
  serviceId,
  auth: {},
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

test("asks each selected provider to sign in once, in category order", () => {
  const flow = new PrepaLogin({
    timetable: Services.CAHIER_DE_PREPA,
    grades: Services.PREPA_PLUS,
    homework: Services.CAHIER_DE_PREPA,
  });

  expect(flow.next).toBe(Services.CAHIER_DE_PREPA);
  expect(flow.add(makeService(Services.PREPA_PLUS))).toBe(false);
  expect(flow.add(makeService(Services.CAHIER_DE_PREPA))).toBe(true);
  expect(flow.next).toBe(Services.PREPA_PLUS);
  expect(flow.add(makeService(Services.CAHIER_DE_PREPA))).toBe(false);
  expect(flow.add(makeService(Services.PREPA_PLUS))).toBe(true);
  expect(flow.next).toBeUndefined();
  expect(flow.services.map(service => service.serviceId)).toEqual([
    Services.CAHIER_DE_PREPA,
    Services.PREPA_PLUS,
  ]);
});
