/**
 * Lopnur - Solana RPC Provider Benchmarking Tool
 *
 * A tool for benchmarking various Solana RPC Providers for Meteora and its programs
 */
import { randomUUID } from "node:crypto";
import { getAllProviders } from "./providers";
import { saveBenchmarkSession } from "./utils/storage";
import { generateSessionSummaries, findBestProvider } from "./utils/analyzer";
import { METEORA_REQUEST_TYPES, runConcurrentMeteoraRequests } from "./benchmarks/meteora";
import type { MeteoraRequestType } from "./benchmarks/meteora";
import type { BenchmarkConfig, BenchmarkSession } from "./models/types";

// Default benchmark configuration
const DEFAULT_CONFIG: BenchmarkConfig = {
	requestCount: 10,
	concurrency: 3,
	requestTypes: [...METEORA_REQUEST_TYPES],
};

/**
 * Run a benchmark session across all providers
 */
async function runBenchmarkSession(
	config: BenchmarkConfig = DEFAULT_CONFIG
): Promise<BenchmarkSession> {
	const providers = getAllProviders();
	const providerNames = providers.map((p) => p.name);

	console.log(`Starting benchmark session with ${providers.length} providers`);
	console.log(`Request types: ${config.requestTypes.join(", ")}`);
	console.log(`Request count: ${config.requestCount} per type, concurrency: ${config.concurrency}`);

	const sessionId = randomUUID();
	const startTime = Date.now();

	const session: BenchmarkSession = {
		id: sessionId,
		startTime,
		providers: providerNames,
		results: [],
		config,
	};

	// Run benchmarks for each provider
	for (const provider of providers) {
		console.log(`Benchmarking provider: ${provider.name}`);

		const results = await runConcurrentMeteoraRequests(
			provider,
			config.requestTypes as MeteoraRequestType[], // Type assertion to handle string[] vs literal type[]
			config.requestCount,
			config.concurrency
		);

		session.results.push(...results);

		// Calculate and display interim results
		const successCount = results.filter((r) => r.success).length;
		const successRate = (successCount / results.length) * 100;
		const avgLatency =
			results.filter((r) => r.success).reduce((sum, r) => sum + r.latencyMs, 0) / successCount || 0;

		console.log(`  Success rate: ${successRate.toFixed(2)}%`);
		console.log(`  Avg latency: ${avgLatency.toFixed(2)}ms`);
	}

	session.endTime = Date.now();

	// Save results
	const filePath = await saveBenchmarkSession(session);
	console.log(`Benchmark results saved to: ${filePath}`);

	// Generate and display summary
	const summaries = generateSessionSummaries(session);
	console.log("\nBenchmark Summary:");

	for (const summary of summaries) {
		console.log(`\nProvider: ${summary.provider}`);
		console.log(`  Success Rate: ${summary.successRate.toFixed(2)}%`);
		console.log(`  Average Latency: ${summary.averageLatencyMs.toFixed(2)}ms`);
		console.log(`  P50 Latency: ${summary.p50LatencyMs.toFixed(2)}ms`);
		console.log(`  P90 Latency: ${summary.p90LatencyMs.toFixed(2)}ms`);
		console.log(`  P99 Latency: ${summary.p99LatencyMs.toFixed(2)}ms`);
	}

	// Find the best provider
	const bestProvider = findBestProvider(summaries);
	if (bestProvider) {
		console.log(`\nBest Provider: ${bestProvider.provider}`);
		console.log(`  Success Rate: ${bestProvider.successRate.toFixed(2)}%`);
		console.log(`  Average Latency: ${bestProvider.averageLatencyMs.toFixed(2)}ms`);
	}

	return session;
}

// Run the benchmark if this file is executed directly
if (import.meta.main) {
	runBenchmarkSession().catch((error) => {
		console.error("Benchmark failed:", error);
		process.exit(1);
	});
}

export { runBenchmarkSession, DEFAULT_CONFIG };
