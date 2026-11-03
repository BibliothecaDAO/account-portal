/**
 * IM Fell English SC is a small-caps face: mixed-case text in it shows a capital, then small
 * capitals. Every title set in it shows in full capitals. Returns each visible element with its
 * own text in the face whose computed text-transform is not uppercase.
 */
export function titleFaceWithoutCapitals(
  root: ParentNode = document.body,
): string[] {
  return [...root.querySelectorAll<HTMLElement>("*")].flatMap((element) => {
    const text = [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join(" ")
      .trim();
    if (!text) return [];
    const style = getComputedStyle(element);
    if (
      !style.fontFamily
        .replace(/["']/g, "")
        .trimStart()
        .startsWith("IM Fell English SC")
    )
      return [];
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
