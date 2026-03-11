import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        plugins: {
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            "react-refresh": pluginReactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: { window: true, document: true, localStorage: true, FormData: true, File: true, console: true, CustomEvent: true },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: "18" } },
        rules: {
            ...pluginReact.configs.recommended.rules,
            ...pluginReactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
    },
];
