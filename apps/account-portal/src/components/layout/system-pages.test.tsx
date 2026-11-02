import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DefaultCatchBoundary, ErrorStateView } from "./default-catch-boundary";
import { LoginCardView } from "./login-card";
import { NotFoundView } from "./not-found";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  ErrorComponent: ({ error }: { error: Error }) => <pre>{error.message}</pre>,
  rootRouteId: "__root__",
  useMatch: () => false,
  useRouter: () => ({ invalidate: vi.fn() }),
}));

describe("DefaultCatchBoundary", () => {
  const error = new Error("Cannot read properties of undefined");
  const render = () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    return renderToStaticMarkup(
      <DefaultCatchBoundary error={error} reset={vi.fn()} />,
    );
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the code line out of production", () => {
    vi.stubEnv("DEV", false);
    expect(render()).not.toContain(error.message);
  });

  it("keeps it for developers", () => {
    vi.stubEnv("DEV", true);
    expect(render()).toContain(error.message);
  });
});

describe("ErrorStateView", () => {
  it("lets a keyboard reach the scrolling details", () => {
    const html = renderToStaticMarkup(
      <ErrorStateView details={<pre>trace</pre>} onRetry={vi.fn()} />,
    );
    expect(html).toContain('tabindex="0"');
  });
});

describe("NotFoundView", () => {
  it("says where the second button goes", () => {
    const html = renderToStaticMarkup(<NotFoundView />);
    expect(html).toContain("Back to dashboard");
    expect(html).not.toContain("Start over");
  });
});

describe("LoginCardView", () => {
  it("asks for the wallet plainly and spells Starknet the way it is spelt", () => {
    const html = renderToStaticMarkup(<LoginCardView action={<button />} />);
    expect(html).toContain("Connect your wallet");
    expect(html).toContain(
      "Use a Starknet wallet to manage your Realms, LORDS and votes.",
    );
    expect(html).not.toContain("Welcome");
    expect(html).not.toContain("StarkNet");
  });
});
