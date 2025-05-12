#!/usr/bin/env bun
/**
 * Lopnur CLI - Solana RPC Provider Benchmarking Tool
 */

import { runBenchmarkSession, DEFAULT_CONFIG } from "../src/index";
import type { BenchmarkConfig } from "../src/models/types";
import { METEORA_REQUEST_TYPES } from "../src/benchmarks/meteora";
import type { MeteoraRequestType } from "../src/benchmarks/meteora";

// Parse command line arguments
const args = process.argv.slice(2);
const flags = new Map<string, string>();

for (let i = 0; i < args.length; i++) {
	const arg = args[i];
	if (arg?.startsWith("--")) {
		const flag = arg.substring(2);
		const nextArg = args[i + 1];
		const value = nextArg && !nextArg.startsWith("--") ? nextArg : "true";
		flags.set(flag, value);
		if (value !== "true") i++;
	}
}

// Help command
if (flags.has("help") || flags.has("h")) {
	console.log(`
Lopnur - Solana RPC Provider Benchmarking Tool

Usage:
  lopnur [options]

Options:
  --count, -c       Number of requests per type (default: ${DEFAULT_CONFIG.requestCount})
  --concurrency, -p Number of concurrent requests (default: ${DEFAULT_CONFIG.concurrency})
  --types, -t       Request types to benchmark (comma-separated)
                    Available types: ${METEORA_REQUEST_TYPES.join(", ")}
  --help, -h        Show this help message

Examples:
  lopnur --count 20 --concurrency 5
  lopnur --types getDLMMPositions
`);
	process.exit(0);
}

// Parse configuration
const config: BenchmarkConfig = {
	...DEFAULT_CONFIG,
	requestCount: Number.parseInt(
		flags.get("count") || flags.get("c") || String(DEFAULT_CONFIG.requestCount),
		10
	),
	concurrency: Number.parseInt(
		flags.get("concurrency") || flags.get("p") || String(DEFAULT_CONFIG.concurrency),
		10
	),
};

// Parse request types
if (flags.has("types") || flags.has("t")) {
	const typesArg = flags.get("types") || flags.get("t") || "";
	const requestTypes = typesArg.split(",").filter(Boolean);

	// Validate request types
	const invalidTypes = requestTypes.filter(
		(type) => !METEORA_REQUEST_TYPES.includes(type as MeteoraRequestType)
	);

	if (invalidTypes.length > 0) {
		console.error(`Error: Invalid request type(s): ${invalidTypes.join(", ")}`);
		console.error(`Available types: ${METEORA_REQUEST_TYPES.join(", ")}`);
		process.exit(1);
	}

	config.requestTypes = requestTypes;
}

// Run the benchmark
console.log("Lopnur - Solana RPC Provider Benchmarking Tool");
runBenchmarkSession(config).catch((error) => {
	console.error("Benchmark failed:", error);
	process.exit(1);
});
