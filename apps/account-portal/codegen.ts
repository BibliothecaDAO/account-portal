import type { CodegenConfig } from "@graphql-codegen/cli";

const target = process.env.CODEGEN_TARGET ?? "all";
const toriiBaseUrl = process.env.VITE_TORII_API_URL?.replace(/\/$/, "");

if (target !== "snapshot" && !toriiBaseUrl) {
  throw new Error(
    "VITE_TORII_API_URL is required for Eternum GraphQL code generation",
  );
}

const config: CodegenConfig = {
  generates: {
    ...(target !== "snapshot"
      ? {
          "./src/gql/eternum/": {
            documents: ["src/lib/eternum/*.ts", "!src/gql/**/*"],
            preset: "client",
            schema: `${toriiBaseUrl}/graphql`,
            config: {
              documentMode: "string",
            },
            presetConfig: {
              fragmentMasking: false,
            },
            plugins: [],
          },
        }
      : {}),
    ...(target !== "eternum"
      ? {
          "./src/gql/snapshot/": {
            documents: ["src/lib/snapshot/*.ts", "!src/gql/**/*"],
            preset: "client",
            schema: "https://api.snapshot.box/",
            config: {
              documentMode: "string",
            },
            presetConfig: {
              fragmentMasking: false,
            },
            plugins: [],
          },
        }
      : {}),
  },
};

export default config;
