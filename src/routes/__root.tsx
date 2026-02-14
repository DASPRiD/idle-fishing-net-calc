import { Container } from "@mui/material";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ErrorCard } from "@/components/ErrorCard";
import { FullPageSpinner } from "@/components/FullPageSpinner";

export type RootRouterContext = {
    queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RootRouterContext>()({
    component: Outlet,
    pendingComponent: FullPageSpinner,
    errorComponent: ({ error }) => (
        <Container maxWidth="md" sx={{ my: 2 }}>
            <ErrorCard error={error} />
        </Container>
    ),
});
