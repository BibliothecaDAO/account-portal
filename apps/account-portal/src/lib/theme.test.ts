import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
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

function listFiles(dir: string, extension: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listFiles(path, extension);
    return path.endsWith(extension) ? [path] : [];
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
    const offenders = listFiles(srcDir, ".tsx")
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
    const offenders = listFiles(srcDir, ".tsx").filter((file) =>
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
    const offenders = listFiles(srcDir, ".tsx")
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

// IM Fell English SC, the title face, and Cinzel, the veLORDS panel's label face, are capitals
// faces: mixed-case text in either shows a capital, then small capitals. Every use of either
// shows in full capitals, by CSS, so the source keeps its case and screen readers read words.
describe("title and label faces", () => {
  const TITLE_FACE = /--font-(?:title|serif|display)|IM Fell English/;
  const LABEL_FACE = /(?<![-\w])Cinzel(?![-\w])/;
  // The stylesheets, named from src/ and comments removed: every .css file under src/, and every
  // file a relative @import in one of them reaches, wherever it lives. An import that names no
  // file beside its stylesheet, such as "tailwindcss", is a package and is not followed.
  const IMPORT = /@import\s+(?:url\(\s*(["']?)([^"')]+)\1\s*\)|(["'])(.*?)\3)/g;
  const isFile = (path: string) => existsSync(path) && statSync(path).isFile();
  const paths = listFiles(srcDir, ".css");
  const sheets: { file: string; css: string }[] = [];
  // for...of also visits the paths the loop appends.
  for (const path of paths) {
    const css = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    sheets.push({ file: relative(srcDir, path), css });
    for (const [, , url, , quoted] of css.matchAll(IMPORT)) {
      const target = resolve(dirname(path), (url ?? quoted).trim());
      const imported = [target, `${target}.css`].find(isFile);
      if (imported && !paths.includes(imported)) paths.push(imported);
    }
  }
  // Every block with its own declarations, nested blocks left out: @layer, @theme and nested
  // rules included.
  const rules: { file: string; selector: string; body: string }[] = [];
  for (const { file, css } of sheets) {
    const open: { selector: string; body: string }[] = [];
    let start = 0;
    for (let i = 0; i < css.length; i++) {
      if (css[i] !== "{" && css[i] !== "}") continue;
      const text = css.slice(start, i);
      if (css[i] === "{") {
        if (open.length)
          open[open.length - 1].body += text.slice(
            0,
            text.lastIndexOf(";") + 1,
          );
        open.push({
          selector: text.slice(text.lastIndexOf(";") + 1).trim(),
          body: "",
        });
      } else {
        const block = open.pop();
        if (!block) throw new Error(`Unbalanced "}" in ${file} at ${i}`);
        block.body += text;
        rules.push({ file, ...block });
      }
      start = i + 1;
    }
  }

  // Every custom property's declared values, from every stylesheet and block: a property declared
  // in :root and again in .dark, or in two files, can take either value.
  const properties = new Map<string, string[]>();
  for (const { body } of rules)
    for (const [, name, value] of body.matchAll(
      /(?:^|;)\s*(--[\w-]+)\s*:\s*([^;]*)/g,
    ))
      properties.set(name, [...(properties.get(name) ?? []), value.trim()]);
  // The index after the parenthesis that closes the one at `open`, quotes skipped.
  const closing = (value: string, open: number) => {
    let depth = 0;
    let quote = "";
    for (let i = open; i < value.length; i++) {
      const c = value[i];
      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = "";
      } else if (c === '"' || c === "'") quote = c;
      else if (c === "(") depth++;
      else if (c === ")" && --depth === 0) return i + 1;
    }
    return value.length;
  };
  // The value's parts between commas outside parentheses and quotes.
  const topLevelParts = (value: string) => {
    const parts: string[] = [];
    let start = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "(") i = closing(value, i) - 1;
      else if (value[i] === '"' || value[i] === "'") {
        const end = value.indexOf(value[i], i + 1);
        i = end < 0 ? value.length : end;
      } else if (value[i] === ",") {
        parts.push(value.slice(start, i).trim());
        start = i + 1;
      }
    }
    return [...parts, value.slice(start).trim()];
  };
  // Every value `value` can compute to: each var() becomes each declared value of its property,
  // cycles left out, and its fallback, since the table does not know where each declaration
  // applies. A var() with neither stays as written.
  const resolveValue = (value: string, seen: string[] = []): string[] => {
    const at = value.search(/(?<![-\w])var\(/);
    if (at < 0) return [value];
    const end = closing(value, at + 3);
    const [name, ...fallback] = topLevelParts(value.slice(at + 4, end - 1));
    const declared = seen.includes(name) ? [] : (properties.get(name) ?? []);
    const replacements = [
      ...declared.flatMap((v) => resolveValue(v, [...seen, name])),
      ...(fallback.length ? resolveValue(fallback.join(", "), seen) : []),
    ];
    if (!replacements.length) replacements.push(value.slice(at, end));
    const rests = resolveValue(value.slice(end), seen);
    return [
      ...new Set(
        replacements.flatMap((r) =>
          rests.map((rest) => value.slice(0, at) + r + rest),
        ),
      ),
    ];
  };
  // A font or font-family value sets a face when its first part names it once resolved: the
  // first family, or for the font shorthand the size and first family. A later family is a
  // fallback, so Cinzel in the IM Fell stack is not a use of Cinzel.
  const setsCapitalsFace = (value: string) =>
    resolveValue(value).some((v) => {
      const first = topLevelParts(v)[0];
      return TITLE_FACE.test(first) || LABEL_FACE.test(first);
    });
  // The families markup sets: inline fontFamily styles, and arbitrary Tailwind classes such as
  // font-[Cinzel], font-[family-name:var(--x)] and [font-family:var(--x)], "_" for a space.
  const markupFamilies = (line: string) => [
    ...[...line.matchAll(/fontFamily:\s*(?:(["'`])(.*?)\1|([^,}]+))/g)].map(
      (m) => m[2] ?? m[3],
    ),
    ...[
      ...line.matchAll(
        /(?:font-\[(?:family-name:)?|\[font-family:)([^\]\s]+)\]/g,
      ),
    ].map((m) => m[1].replaceAll("_", " ")),
  ];
  const markup = [
    ...listFiles(srcDir, ".tsx"),
    ...listFiles(resolve(srcDir, "../.storybook"), ".tsx"),
  ];

  it("sets text-transform: uppercase in every CSS rule that sets it", () => {
    const found: string[] = [];
    const missing: string[] = [];
    for (const { file, selector, body } of rules) {
      const fonts = [
        ...body.matchAll(/(?:^|;)\s*font(?:-family)?\s*:\s*([^;]+)/g),
      ];
      if (
        selector.startsWith("@font-face") ||
        !fonts.some((m) => setsCapitalsFace(m[1]))
      )
        continue;
      found.push(selector);
      if (!/(?:^|;)\s*text-transform\s*:\s*uppercase\b/.test(body))
        missing.push(`${file}: ${selector}`);
    }
    expect(found).toEqual(
      expect.arrayContaining([
        expect.stringContaining(".realm-title"),
        ".realm-page-title",
        ".realm-card-title",
        expect.stringContaining(".realm-prose-h1"),
        expect.stringContaining(".deck-values .realm-chip"),
      ]),
    );
    expect(missing).toEqual([]);
  });

  it("has no Tailwind font utility, which would set the face without its capitals", () => {
    const themeKeys = rules.flatMap(({ file, selector, body }) =>
      selector.startsWith("@theme")
        ? [...body.matchAll(/(?:^|;)\s*(--font-[\w-]+)\s*:\s*([^;]+)/g)]
            .filter(
              ([, key, value]) =>
                /^--font-(?:title|serif|display)$/.test(key) ||
                setsCapitalsFace(value),
            )
            .map(([, key]) => `${file}: ${selector} ${key}`)
        : [],
    );
    const classes = markup.flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          /(?<![-\w])font-(?:title|serif|display)(?![-\w])/.test(line)
            ? [`${file}:${i + 1}`]
            : [],
        ),
    );
    expect(themeKeys).toEqual([]);
    expect(classes).toEqual([]);
  });

  it("is set from markup only through a CSS class", () => {
    const offenders = markup.flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          /var\(--font-(?:title|serif|display)\)/.test(line) ||
          markupFamilies(line).some(setsCapitalsFace)
            ? [`${file}:${i + 1}: ${line.trim()}`]
            : [],
        ),
    );
    expect(offenders).toEqual([]);
  });
});
