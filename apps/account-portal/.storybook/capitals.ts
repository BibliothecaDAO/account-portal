/**
 * IM Fell English SC (titles) and Cinzel (the veLORDS panel's labels) are capitals faces:
 * mixed-case text in either shows a capital, then small capitals. Every use of either shows in
 * full capitals. Returns each visible element with its own text in one of them whose computed
 * text-transform is not uppercase.
 */
const CAPITALS_FACES = ["IM Fell English SC", "Cinzel"];

export function missingCapitals(root: ParentNode = document.body): string[] {
  return [...root.querySelectorAll<HTMLElement>("*")].flatMap((element) => {
    const text = [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join(" ")
      .trim();
    if (!text) return [];
    const style = getComputedStyle(element);
    const family = style.fontFamily.replace(/["']/g, "").trimStart();
    if (!CAPITALS_FACES.some((face) => family.startsWith(face))) return [];
    if (style.textTransform === "uppercase") return [];
    if (
      !element.checkVisibility({
        opacityProperty: true,
        visibilityProperty: true,
      })
    )
      return [];
    return [
      `<${element.tagName.toLowerCase()} class="${element.className}"> ${text.slice(0, 60)} (${style.textTransform})`,
    ];
  });
}
