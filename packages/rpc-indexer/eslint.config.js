import baseConfig from "@realms-world/eslint-config/base";

export default [...baseConfig, { ignores: ["dist/**", "build.mjs"] }];
