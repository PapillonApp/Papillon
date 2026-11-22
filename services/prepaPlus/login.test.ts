import { beforeEach, expect, jest, test } from "@jest/globals";
import { fetch } from "expo/fetch";

import { loginPrepaPlus } from "./login";

jest.mock("expo/fetch", () => ({ fetch: jest.fn() }));

const request = jest.mocked(fetch);
const origin = "https://school.prepas-plus.fr";

function mockLogin(
  location: string,
  cookie = "sessionid=test-session; HttpOnly"
) {
  request.mockResolvedValueOnce(
    new Response(
      '<input name="csrfmiddlewaretoken" type="hidden" value="form-token">',
      {
        headers: { "Set-Cookie": "csrftoken=cookie-token; Secure" },
      }
    ) as Awaited<ReturnType<typeof fetch>>
  );
  request.mockResolvedValueOnce(
    new Response(null, {
      status: 302,
      headers: { Location: location, "Set-Cookie": cookie },
    }) as Awaited<ReturnType<typeof fetch>>
  );
}

beforeEach(() => {
  request.mockReset();
});

test("signs in with the form token and its separate cookie", async () => {
  mockLogin("/home/");
  await expect(
    loginPrepaPlus(origin, "student", "test-password")
  ).resolves.toBe("test-session");
  expect(request).toHaveBeenNthCalledWith(
    2,
    origin + "/account/login/",
    expect.objectContaining({
      headers: expect.objectContaining({ Cookie: "csrftoken=cookie-token" }),
      body: "csrfmiddlewaretoken=form-token&login_view-current_step=auth&auth-username=student&auth-password=test-password",
      redirect: "manual",
    })
  );
});

test.each([
  ["/account/login/?next=/home/", "sessionid=test-session"],
  ["https://other.prepas-plus.fr/home/", "sessionid=test-session"],
  ["/home/", "unrelated=token"],
])(
  "rejects a response without a valid school session (%s)",
  async (location, cookie) => {
    mockLogin(location, cookie);
    await expect(
      loginPrepaPlus(origin, "student", "test-password")
    ).rejects.toThrow();
  }
);

test("does not send credentials to a domain outside Prépa Plus", async () => {
  await expect(
    loginPrepaPlus(origin + ".example.org", "student", "test-password")
  ).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
});
