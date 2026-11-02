import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent } from "./tabs";

describe("TabsContent", () => {
  it("shows when it has focus, since the panel is a tab stop", () => {
    const html = renderToStaticMarkup(
      <Tabs value="a">
        <TabsContent value="a">Panel</TabsContent>
      </Tabs>,
    );

    expect(html).toContain("focus-visible:ring-[3px]");
    expect(html).toContain("focus-visible:ring-ring/50");
  });
});
