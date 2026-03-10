import { isMatch, Link, useMatches } from "@tanstack/react-router";

export const Breadcrumbs = () => {
  const matches = useMatches();
  if (matches.some((match) => match.status === "pending")) return null;

  const matchesWithCrumbs = matches.filter((match) =>
    isMatch(match, "loaderData.crumb"),
  );

  return (
    <nav>
      <ul className="flex items-center gap-2 [font-family:var(--font-ui)] text-xs tracking-[0.18em] uppercase">
        {matchesWithCrumbs.map((match, i) => (
          <li className="flex gap-2">
            <Link
              className="realm-nav-link text-primary/90"
              from={match.fullPath}
            >
              {match.loaderData?.crumb}
            </Link>
            {i + 1 < matchesWithCrumbs.length ? (
              <span className="text-primary/45">{">"}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
};
