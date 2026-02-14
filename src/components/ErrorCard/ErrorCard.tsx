import { Button, Card, CardActions, CardContent, Divider, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { serializeError } from "serialize-error";

type Props = {
    error: Error;
};

export const ErrorCard = ({ error }: Props): ReactNode => {
    const errorDetails = JSON.stringify(
        {
            path: window.location.pathname,
            error: serializeError(error),
        },
        undefined,
        2,
    );

    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        color: "error",
                    }}
                >
                    Something went wrong
                </Typography>
                <Typography>An unexpected error occurred, please try again.</Typography>
            </CardContent>
            <CardActions disableSpacing>
                <Button component="a" href="/">
                    Reload the app
                </Button>
            </CardActions>
            <Divider />
            <CardContent>
                <Typography
                    sx={{
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {errorDetails}
                </Typography>
            </CardContent>
        </Card>
    );
};
