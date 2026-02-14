import { MultiProvider } from "@/components/MultiProvider/index.ts";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FullPageSpinner } from "@/components/FullPageSpinner/index.js";
import { routeTree } from "@/routeTree.gen.js";

const container = document.getElementById("root");

if (!container) {
    throw new Error("Root container missing");
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#d35015",
        },
    },
});

const root = createRoot(container);

const router = createRouter({
    basepath: import.meta.env.VITE_APP_SUB_PATH,
    routeTree,
    defaultPendingComponent: FullPageSpinner,
    context: {
        queryClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

root.render(
    <StrictMode>
        <MultiProvider
            providerCreators={[
                (children) => (
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {children}
                    </ThemeProvider>
                ),
                (children) => (
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                ),
            ]}
        >
            <RouterProvider router={router} />
        </MultiProvider>
    </StrictMode>,
);
