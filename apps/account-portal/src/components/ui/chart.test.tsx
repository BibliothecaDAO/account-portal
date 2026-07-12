// @vitest-environment jsdom

import type * as RechartsModule from "recharts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChartContainer, ChartTooltipContent, toChartKey } from "./chart";

vi.mock("env", () => ({
  env: {
    VITE_PUBLIC_CHAIN: "mainnet",
    VITE_TORII_API_URL: "https://torii.example.test",
    VITE_PUBLIC_SLOT: "test",
  },
}));
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof RechartsModule>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

describe("toChartKey", () => {
  it("preserves zero-valued keys instead of falling through", () => {
    expect(toChartKey(0, "fallback")).toBe("0");
  });
});

describe("ChartTooltipContent", () => {
  it("renders zero values and passes the complete payload to formatters", () => {
    const formatter = vi.fn(() => <span>formatted zero</span>);
    const payload = [
      {
        color: "#fff",
        dataKey: 0,
        graphicalItemId: "balance",
        name: "balance",
        payload: { fill: "#fff" },
        value: 0,
      },
    ];

    render(
      <ChartContainer config={{ "0": { label: "Balance" } }}>
        <ChartTooltipContent active payload={payload} formatter={formatter} />
      </ChartContainer>,
    );

    expect(screen.getByText("formatted zero")).toBeVisible();
    expect(formatter).toHaveBeenCalledWith(
      0,
      "balance",
      payload[0],
      0,
      payload,
    );
  });
});
