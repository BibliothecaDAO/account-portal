import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("draws a minus when partly on and a check when on", () => {
    const partly = renderToStaticMarkup(<Checkbox checked="indeterminate" />);
    const on = renderToStaticMarkup(<Checkbox checked />);

    expect(partly).toContain("lucide-minus");
    expect(partly).not.toContain("lucide-check");
    expect(on).toContain("lucide-check");
    expect(on).not.toContain("lucide-minus");
  });
});
