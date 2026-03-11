module.exports = {
    env: { node: true, es2022: true },
    extends: ["eslint:recommended"],
    parserOptions: { ecmaVersion: "latest", sourceType: "commonjs" },
    rules: {
        "no-console": "off",
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "no-process-exit": "off",
    },
};
