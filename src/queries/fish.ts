import { queryOptions } from "@tanstack/react-query";
import { z } from "zod/mini";

const stringColumnSchema = z.pipe(
    z.object({ v: z.string() }),
    z.transform((value) => value.v),
);

const floatColumnSchema = z.pipe(
    z.object({ v: z.number() }),
    z.transform((value) => value.v),
);

const netLocations = ["Lake", "River", "Ocean", "Sphere"] as const;
export type NetLocation = (typeof netLocations)[number];

const notNull = <T>(value: T | null): value is T => value !== null;

const sheetSchema = z.pipe(
    z.object({
        table: z.object({
            rows: z.array(
                z.object({
                    c: z.union([
                        z.pipe(
                            z.tuple(
                                [
                                    z.unknown(),
                                    stringColumnSchema,
                                    z.pipe(
                                        stringColumnSchema,
                                        z.transform((value) =>
                                            value
                                                .split(",")
                                                .map((value) => value.trim())
                                                .filter((value): value is NetLocation =>
                                                    (netLocations as readonly string[]).includes(
                                                        value,
                                                    ),
                                                ),
                                        ),
                                    ),
                                    z.unknown(),
                                    stringColumnSchema,
                                    z.unknown(),
                                    z.nullable(stringColumnSchema),
                                    z.unknown(),
                                    z.nullable(stringColumnSchema),
                                    z.unknown(),
                                    z.nullable(stringColumnSchema),
                                    z.unknown(),
                                    z.nullable(stringColumnSchema),
                                    z.unknown(),
                                    z.unknown(),
                                    floatColumnSchema,
                                ],
                                z.unknown(),
                            ),
                            z.transform((value) => {
                                const traits = [value[4]];

                                if (value[6]) {
                                    traits.push(value[6]);
                                }

                                if (value[8]) {
                                    traits.push(value[8]);
                                }

                                if (value[10]) {
                                    traits.push(value[10]);
                                }

                                if (value[12]) {
                                    traits.push(value[12]);
                                }

                                return {
                                    name: value[1],
                                    locations: value[2],
                                    traits,
                                    catchChange: value[15],
                                };
                            }),
                        ),
                        z.pipe(
                            z.tuple([z.null(), z.null()], z.unknown()),
                            z.transform(() => null),
                        ),
                    ]),
                }),
            ),
        }),
    }),
    z.transform((value) => value.table.rows.map((row) => row.c).filter(notNull)),
);
export type Fish = z.output<typeof sheetSchema>[number];

export const listFishesQueryOptions = () =>
    queryOptions({
        queryKey: ["fishes"],
        queryFn: async ({ signal }) => {
            const response = await fetch(
                "https://docs.google.com/spreadsheets/d/1Jjnb8iEAwjbBlcdJWPoWMWME0rtCMlzkOHtiHDQWl-8/gviz/tq?gid=73701886&tq=SELECT+*",
                { signal },
            );

            if (!response.ok) {
                throw new Error("Failed to fetch fish data");
            }

            const raw = await response.text();
            const json = raw.substring(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
            const data = JSON.parse(json);
            return sheetSchema.parse(data);
        },
    });
