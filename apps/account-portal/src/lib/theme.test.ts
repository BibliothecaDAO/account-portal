import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(srcDir, path), "utf8");

const styles = read("styles.css");
const rootRoute = read("routes/__root.tsx");
const indexRoute = read("routes/index.tsx");
const homepage = read("components/modules/homepage/homepage.tsx");
const realmsPreview = read("components/modules/homepage/realms-preview.tsx");
const appSidebar = read("components/layout/nav-config.ts");
const velordsIndex = read("routes/velords.index.tsx");
const markdownRenderer = read("components/ui/markdown-renderer.tsx");

function listTsx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listTsx(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("account portal theme", () => {
  it("uses the marketplace font stack from local brand files", () => {
    expect(styles).toContain('url("/brand/im-fell-english-sc-regular.ttf")');
    expect(styles).toContain('url("/brand/fonts/exo-2-variable.ttf")');
    expect(styles).toContain("monaspace-xenon-400.woff2");
    expect(styles).toContain('url("/brand/fonts/Cinzel-SemiBold.ttf")');
    expect(styles).toContain('--font-title: "IM Fell English SC"');
    expect(styles).not.toContain("fonts.googleapis.com");
  });

  it("defines the marketplace graphite dark tokens", () => {
    expect(styles).toContain("--background: #0b0c0f;");
    expect(styles).toContain("--card: #14161a;");
    expect(styles).toContain("--primary: #e7cf88;");
    expect(styles).toContain("--realm-accent-brass");
    expect(styles).toContain("--color-trade-up: var(--trade-up);");
    expect(styles).toContain("@theme inline");
  });

  it("is always dark, with no theme switch and no light colors", () => {
    expect(rootRoute).toContain('<html lang="en" className="dark">');
    expect(rootRoute).not.toMatch(/ThemeProvider|localStorage|classList/);
    expect(read("components/layout/nav-user.tsx")).not.toContain("ModeToggle");
    expect(existsSync(resolve(srcDir, "providers/theme.tsx"))).toBe(false);
    expect(existsSync(resolve(srcDir, "components/layout/mode-toggle.tsx"))).toBe(false);

    const root = /:root \{(.*?)\n\}/s.exec(styles)?.[1];
    expect(root).toContain("--radius");
    for (const role of ["--background", "--foreground", "--card", "--primary", "--border"]) {
      expect(root).not.toContain(`${role}:`);
    }
  });

  it("keeps the shared type hierarchy classes", () => {
    for (const cls of [
      ".realm-page-title",
      ".realm-card-title",
      ".realm-group-title",
      ".realm-label",
      ".realm-stat",
    ]) {
      expect(styles).toContain(cls);
    }
    expect(markdownRenderer).toContain("realm-prose-h1");
  });

  it("uses no arbitrary colour, shadow or tracking values in components", () => {
    const offenders = listTsx(srcDir)
      .filter((file) => !file.endsWith(".stories.tsx"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        const hits = source.match(
          /\b(?:bg|text|border|shadow|fill|stroke)-\[(?:color:|#|var\(|rgba?\(|oklch\(|0_|inset_)[^\]]*\]|\[letter-spacing:[^\]]*\]/g,
        );
        return hits ? [`${file}: ${hits.join(", ")}`] : [];
      });
    expect(offenders).toEqual([]);
  });

  it("keeps the delegate action column at 7rem, which the 12 px outline button fits", () => {
    expect(styles).toContain("11.875rem 5.5rem 7rem;");
    expect(styles).toContain("minmax(0, 1.7fr) 7rem;");
  });

  it("tells the browser the portal is dark, so native controls never draw pale", () => {
    expect(styles).toMatch(/\.dark \{\n {2}color-scheme: dark;/);
  });

  it("never sets an overflow on a tab bar, which computes overflow-y to auto and scrolls it", () => {
    const offenders = listTsx(srcDir).filter((file) =>
      /<TabsList[^>]*overflow-/.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("names what controls animate, so nothing but those can move", () => {
    for (const control of ["button", "tabs", "switch", "toast"]) {
      expect(read(`components/ui/${control}.tsx`)).not.toContain("transition-all");
    }
  });

  it("builds the dashboard from shared page primitives", () => {
    expect(indexRoute).toContain("PageContainer");
    expect(indexRoute).toContain("PageHeader");
    expect(homepage).toContain("DashboardStats");
    expect(homepage).toContain("SectionCard");
    expect(velordsIndex).toContain("PageHeader");
    expect(velordsIndex).toContain("MetricCard");
  });

  it("has no coming-soon page, route or label", () => {
    expect(existsSync(resolve(srcDir, "routes/coming-soon.index.tsx"))).toBe(false);
    expect(read("routeTree.gen.ts")).not.toContain("coming-soon");
    expect(appSidebar).not.toContain("coming-soon");
    expect(read("components/layout/system.stories.tsx")).not.toContain("ComingSoon");
  });

  it("has each story's play wait for the router before its first query", () => {
    const offenders = listTsx(srcDir)
      .filter((file) => file.endsWith(".stories.tsx"))
      .flatMap((file) =>
        readFileSync(file, "utf8")
          .split(/\bplay: async/)
          .slice(1)
          .map((play) => /\b(?:find|get|query)(?:All)?By\w+/.exec(play)?.[0])
          .filter((query) => query && !query.startsWith("find"))
          .map((query) => `${file}: ${query}`),
      );
    expect(offenders).toEqual([]);
  });

  it("points marketplace CTAs at market.realms.world", () => {
    expect(realmsPreview).toContain('href="https://market.realms.world"');
    expect(indexRoute).toContain('href="https://market.realms.world"');
  });

  it("uses the cleaned sidebar destination map", () => {
    expect(appSidebar).toContain('{ title: "Claims", url: "/realms/claims" }');
    expect(appSidebar).not.toContain("https://market.realms.world");
    expect(appSidebar).toContain('url: "https://realms.world"');
    expect(appSidebar).toContain('url: "https://blitz.realms.world"');
    expect(appSidebar).toContain('url: "https://docs.realms.world"');
  });
});
