import {
    Autocomplete,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import { type Fish, listFishesQueryOptions, type NetLocation } from "@/queries/fish.js";

type Qubie = {
    name: string;
    fishes: Fish[];
};

type PlacementResult = {
    placement: Partial<Record<NetLocation, string>>;
    expectedScore: number;
};

const permute = <T,>(array: T[]): T[][] => {
    if (array.length === 0) {
        return [[]];
    }

    const result: T[][] = [];

    for (let i = 0; i < array.length; i++) {
        const rest = [...array.slice(0, i), ...array.slice(i + 1)];

        for (const p of permute(rest)) {
            result.push([array[i], ...p]);
        }
    }

    return result;
};

const generateAssignments = (
    cubies: string[],
    locs: NetLocation[],
): Partial<Record<NetLocation, string>>[] => {
    const assignments: Partial<Record<NetLocation, string>>[] = [];
    const permutedLocs = permute(locs).filter((p) => p.length >= cubies.length);

    for (const locPerm of permutedLocs) {
        const assignment: Partial<Record<NetLocation, string>> = {};

        for (let i = 0; i < cubies.length; i++) {
            assignment[locPerm[i]] = cubies[i];
        }

        assignments.push(assignment);
    }

    return assignments;
};

const computeOptimalCubiePlacement = (
    cubies: Qubie[],
    selectedCubies: string[],
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: We're good"
): PlacementResult => {
    if (selectedCubies.length === 0) {
        return {
            placement: {},
            expectedScore: 0,
        };
    }

    const locations: NetLocation[] = ["Lake", "River", "Ocean", "Sphere"];

    const cubieToFishes: Record<string, Fish[]> = {};

    for (const group of cubies) {
        cubieToFishes[group.name] = group.fishes;
    }

    const cubieScores: Record<string, Record<NetLocation, number>> = {};

    for (const cubie of selectedCubies) {
        cubieScores[cubie] = { Lake: 0, River: 0, Ocean: 0, Sphere: 0 };
        const fishes = cubieToFishes[cubie] ?? [];

        for (const fish of fishes) {
            for (const loc of fish.locations) {
                if (locations.includes(loc)) {
                    cubieScores[cubie][loc] += fish.catchChange;
                }
            }
        }
    }

    let bestPlacement: Partial<Record<NetLocation, string>> = {};
    let bestScore = -Infinity;

    const allAssignments = generateAssignments(selectedCubies, locations);

    for (const assignment of allAssignments) {
        let score = 0;

        const countedFish = new Set<string>();

        for (const group of cubies) {
            for (const fish of group.fishes) {
                for (const loc of fish.locations) {
                    const cubieInLocation = assignment[loc];

                    if (
                        cubieInLocation &&
                        fish.traits.includes(cubieInLocation) &&
                        !countedFish.has(fish.name)
                    ) {
                        score += fish.catchChange;
                        countedFish.add(fish.name);
                        break;
                    }
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestPlacement = assignment;
        }
    }

    return { placement: bestPlacement, expectedScore: bestScore };
};

const Root = (): ReactNode => {
    const fishes = useSuspenseQuery(listFishesQueryOptions()).data;
    const qubies = useMemo(() => {
        const qubies: Qubie[] = [];

        for (const fish of fishes) {
            for (const trait of fish.traits) {
                let qubie = qubies.find((qubie) => qubie.name === trait);

                if (!qubie) {
                    qubie = { name: trait, fishes: [] };
                    qubies.push(qubie);
                }

                qubie.fishes.push(fish);
            }
        }

        qubies.sort((a, b) => a.name.localeCompare(b.name));
        return qubies;
    }, [fishes]);
    const [selectedQubies, setSelectedQubies] = useState<Qubie[]>([]);
    const optimalPlacement = useMemo(
        () =>
            computeOptimalCubiePlacement(
                qubies,
                selectedQubies.map((qubie) => qubie.name),
            ),
        [qubies, selectedQubies],
    );

    return (
        <Container maxWidth="sm" sx={{ my: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Idle Fishing Net Calculator
                </Typography>
                <Typography sx={{ mb: 2 }}>
                    Select up to four qubies you want to fish, either passively with your nets or
                    actively with your rod. This application will calculate the optimal locations
                    for you.
                </Typography>
                <Autocomplete
                    renderInput={(params) => <TextField {...params} label="Qubies" />}
                    getOptionLabel={(option) => option.name}
                    options={qubies}
                    multiple
                    getOptionDisabled={(option) =>
                        selectedQubies.length === 4 &&
                        !selectedQubies.some((qubie) => qubie.name === option.name)
                    }
                    onChange={(_event, value) => {
                        setSelectedQubies(value);
                    }}
                    sx={{ mb: 2 }}
                />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Location</TableCell>
                                <TableCell>Qubie</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {optimalPlacement.placement.Lake && (
                                <TableRow>
                                    <TableCell>Lake</TableCell>
                                    <TableCell>{optimalPlacement.placement.Lake}</TableCell>
                                </TableRow>
                            )}
                            {optimalPlacement.placement.River && (
                                <TableRow>
                                    <TableCell>River</TableCell>
                                    <TableCell>{optimalPlacement.placement.River}</TableCell>
                                </TableRow>
                            )}
                            {optimalPlacement.placement.Sphere && (
                                <TableRow>
                                    <TableCell>Sphere</TableCell>
                                    <TableCell>{optimalPlacement.placement.Sphere}</TableCell>
                                </TableRow>
                            )}
                            {optimalPlacement.placement.Ocean && (
                                <TableRow>
                                    <TableCell>Ocean</TableCell>
                                    <TableCell>{optimalPlacement.placement.Ocean}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export const Route = createFileRoute("/")({
    component: Root,
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(listFishesQueryOptions());
    },
});
