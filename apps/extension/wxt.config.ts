import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from "wxt";

import pkg from "./package.json" with { type: "json" };

export default defineConfig({
    vite: () => ({
        plugins: [
            visualizer((outputOptions) => {
                const build_name = outputOptions.name
                    ? outputOptions.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()
                    : "extension";

                return {
                    filename: `stats/${build_name}.html`,
                    open: false
                };
            })
        ]
    }),

    srcDir: "src",
    imports: {
        // @ts-ignore stop importing their slop into packages without my consent
        disabled: true,
        exclude: [/packages\//]
    },

    manifest: {
        name: "ViewportVR",
        version: pkg.version,
        description: pkg.description,
        host_permissions: ["https://*/*"],
        permissions: [
            "contextMenus",
            "tabCapture",
            "activeTab",
            "offscreen",
            "debugger",
            "storage"
        ],
        content_security_policy: {
            extension_pages:
                "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
        }
    },

    alias: {
        "@viewportvr/asset-resolver": "./src/shims/asset-resolver.ts"
    },

    modules: ["@wxt-dev/auto-icons"],

    //@ts-ignore
    autoIcons: {
        baseIconPath: "./assets/icon.png",
        sizes: [16, 32, 48, 96, 128],
        developmentIndicator: "overlay"
    }
});
