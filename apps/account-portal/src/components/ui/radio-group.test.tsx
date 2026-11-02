import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroupItem", () => {
  it("draws its dot and ring in the option's own color", () => {
    const html = renderToStaticMarkup(
      <RadioGroup value="a">
        <RadioGroupItem value="a" className="text-success" />
      </RadioGroup>,
    );

    expect(html).toContain("text-success");
    expect(html).toContain("inset-ring");
    expect(html).toContain("fill-current");
    expect(html).not.toContain("fill-primary");
  });
});
