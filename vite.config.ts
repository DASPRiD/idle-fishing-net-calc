import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tanstackRouter from "@tanstack/router-plugin/vite";

export default defineConfig({
    base: process.env.VITE_APP_SUB_PATH,
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
            routeFileIgnorePrefix: "-",
            quoteStyle: "double",
            semicolons: true,
            customScaffolding: {
                routeTemplate: [
                    '%%tsrImports%%',
                    'import type { ReactNode } from "react";\n\n',
                    'const Root = (): ReactNode => "Hello %%tsrPath%%!";\n\n',
                    '%%tsrExportStart%%{\n component: Root\n }%%tsrExportEnd%%'
                ].join("\n"),
            },
        }),
        react(),
        tsconfigPaths(),
        visualizer(),
    ],
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom"],
                    mui: [
                        "@mui/material",
                        "@emotion/react",
                        "@emotion/styled",
                    ],
                    query: ["@tanstack/react-query"],
                    zod: ["zod"],
                },
            },
            // @see https://github.com/vitejs/vite/issues/15012
            onwarn(warning, defaultHandler) {
                if (warning.code === 'SOURCEMAP_ERROR') {
                    return;
                }

                defaultHandler(warning)
            },
        },
    },
    server: {
        port: 5000,
    },
});
