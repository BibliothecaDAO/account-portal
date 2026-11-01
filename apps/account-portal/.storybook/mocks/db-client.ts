// Storybook-only stand-in for @realms-world/db/client. The real module reads DATABASE_URL
// when it loads; stories render fixture props, so any query must fail loudly here.
const db: unknown = new Proxy(() => {}, {
  get: () => db,
  apply() {
    throw new Error("The database is unavailable in Storybook");
  },
});

export { db };
