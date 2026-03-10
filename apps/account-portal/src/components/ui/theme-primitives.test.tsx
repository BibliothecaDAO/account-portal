import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buttonVariants } from "./button";
import { Card } from "./card";

describe("theme primitives", () => {
  it("applies the realms button treatment to shared button variants", () => {
    expect(buttonVariants()).toContain("realm-button");
    expect(buttonVariants({ variant: "outline" })).toContain(
      "realm-button--ghost",
    );
  });

  it("renders cards with the realms panel treatment", () => {
    const markup = renderToStaticMarkup(<Card>Portal</Card>);

    expect(markup).toContain("realm-panel");
  });
});
