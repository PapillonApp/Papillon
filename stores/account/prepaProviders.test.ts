import { expect, test } from "@jest/globals";

import { getPrepaSelection, getPrepaServiceIds } from "./prepaProviders";
import { PrepaLogin } from "./pendingPrepaLogin";
import { type Account, type ServiceAccount, Services } from "./types";

function service(id: string, serviceId: Services): ServiceAccount {
  return { id, serviceId, auth: {}, createdAt: "", updatedAt: "" };
}

const account: Account = {
  id: "student",
  firstName: "Test",
  lastName: "Student",
  services: [
    service("pronote", Services.PRONOTE),
    service("cahier", Services.CAHIER_DE_PREPA),
    service("plus", Services.PREPA_PLUS),
  ],
  createdAt: "",
  updatedAt: "",
};

test("routes each feature to its selected provider and does not substitute another when disconnected", () => {
  const selection = {
    timetable: Services.CAHIER_DE_PREPA,
    grades: Services.PREPA_PLUS,
    homework: Services.PRONOTE,
  } as const;
  const selected = { ...account, prepaServices: selection };
  expect(getPrepaServiceIds(selected, "timetable")).toEqual(["cahier"]);
  expect(getPrepaServiceIds(selected, "grades")).toEqual(["plus"]);
  expect(getPrepaServiceIds(selected, "homework")).toEqual(["pronote"]);
  expect(
    getPrepaServiceIds(
      { ...selected, services: [account.services[0]] },
      "grades"
    )
  ).toEqual([]);
});

test("settings asks only for newly selected providers on an existing account", () => {
  const selection = {
    timetable: Services.CAHIER_DE_PREPA,
    grades: Services.PREPA_PLUS,
    homework: Services.CAHIER_DE_PREPA,
  } as const;
  const flow = new PrepaLogin(
    selection,
    account.services.slice(0, 2),
    "/(settings)/prepaProviders"
  );
  expect(flow.next).toBe(Services.PREPA_PLUS);
  expect(flow.add(account.services[2])).toBe(true);
  expect(flow.next).toBeUndefined();
  expect(flow.returnTo).toBe("/(settings)/prepaProviders");
});

test("legacy Prépa accounts default to the dedicated providers when linked", () => {
  expect(getPrepaSelection(account)).toEqual({
    timetable: Services.CAHIER_DE_PREPA,
    grades: Services.PREPA_PLUS,
    homework: Services.CAHIER_DE_PREPA,
  });
});

test("upgrades unsupported choices saved by the original onboarding without changing supported choices", () => {
  const legacy: Account = {
    ...account,
    prepaServices: {
      timetable: Services.PRONOTE,
      grades: Services.CAHIER_DE_PREPA,
      homework: Services.PREPA_PLUS,
    },
  };
  expect(getPrepaSelection(legacy)).toEqual({
    timetable: Services.PRONOTE,
    grades: Services.PREPA_PLUS,
    homework: Services.CAHIER_DE_PREPA,
  });
  expect(getPrepaServiceIds(legacy, "grades")).toEqual(["plus"]);
});
