import { describe, expect, it } from "vitest";

import { getBreadcrumbs, navGroups } from "./nav-config";

const crumbs = (pathname: string) =>
  getBreadcrumbs(pathname).map(({ label, url }) => [label, url]);

describe("getBreadcrumbs", () => {
  it("links each section to its list page, which adds no crumb of its own", () => {
    expect(crumbs("/delegate/list")).toEqual([["Delegates", "/delegate/list"]]);
    expect(crumbs("/proposal/list")).toEqual([["Proposals", "/proposal/list"]]);
  });

  it("keeps the section link above a page inside it", () => {
    expect(crumbs("/delegate/profile")).toEqual([
      ["Delegates", "/delegate/list"],
      ["Profile", "/delegate/profile"],
    ]);
    expect(crumbs("/proposal/abc")).toEqual([
      ["Proposals", "/proposal/list"],
      ["abc", "/proposal/abc"],
    ]);
  });

  it("leaves sections with an index route as they are", () => {
    expect(crumbs("/realms/claims")).toEqual([
      ["Realms", "/realms"],
      ["Claims", "/realms/claims"],
    ]);
  });
});

describe("navGroups", () => {
  it("reads as one list of destinations above the Information group", () => {
    expect(navGroups.map((group) => group.label)).toEqual([
      undefined,
      "Information",
    ]);
    expect(navGroups[0]?.items.map((item) => item.title)).toEqual([
      "Dashboard",
      "Realms",
      "veLORDS",
      "Delegates",
      "Proposals",
    ]);
  });
});
