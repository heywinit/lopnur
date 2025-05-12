/**
 * Utilities for analyzing benchmark results
 */
import type { BenchmarkResult, BenchmarkSession, BenchmarkSummary } from "../models/types";

/**
 * Calculate percentile from an array of values
 */
function percentile(values: number[], p: number): number {
	if (values.length === 0) return 0;

	const sorted = [...values].sort((a, b) => a - b);
	const position = (sorted.length - 1) * (p / 100);
	const base = Math.floor(position);
	const rest = position - base;

	if (base + 1 < sorted.length) {
		const baseValue = sorted[base] || 0;
		const nextValue = sorted[base + 1] || 0;
		return baseValue + rest * (nextValue - baseValue);
	}

	return sorted[base] ?? 0;
}

/**
 * Generate a summary of benchmark results for a provider
 */
export function generateProviderSummary(
	provider: string,
	results: BenchmarkResult[]
): BenchmarkSummary {
	// Filter results for this provider
	const providerResults = results.filter((result) => result.provider === provider);

	if (providerResults.length === 0) {
		return {
			provider,
			successRate: 0,
			averageLatencyMs: 0,
			p50LatencyMs: 0,
			p90LatencyMs: 0,
			p99LatencyMs: 0,
			minLatencyMs: 0,
			maxLatencyMs: 0,
			requestCount: 0,
			errorCount: 0,
		};
	}

	// Calculate success metrics
	const successfulResults = providerResults.filter((result) => result.success);
	const successRate = (successfulResults.length / providerResults.length) * 100;
	const errorCount = providerResults.length - successfulResults.length;

	// Extract latencies from successful results
	const latencies = successfulResults.map((result) => result.latencyMs);

	// Calculate latency metrics
	const averageLatencyMs =
		latencies.length > 0
			? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length
			: 0;

	const p50LatencyMs = percentile(latencies, 50);
	const p90LatencyMs = percentile(latencies, 90);
	const p99LatencyMs = percentile(latencies, 99);
	const minLatencyMs = latencies.length > 0 ? Math.min(...latencies) : 0;
	const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : 0;

	return {
		provider,
		successRate,
		averageLatencyMs,
		p50LatencyMs,
		p90LatencyMs,
		p99LatencyMs,
		minLatencyMs,
		maxLatencyMs,
		requestCount: providerResults.length,
		errorCount,
	};
}

/**
 * Generate summaries for all providers in a benchmark session
 */
export function generateSessionSummaries(session: BenchmarkSession): BenchmarkSummary[] {
	return session.providers.map((provider) => generateProviderSummary(provider, session.results));
}

/**
 * Compare providers and determine the best one based on criteria
 */
export function findBestProvider(summaries: BenchmarkSummary[]): BenchmarkSummary | null {
	if (summaries.length === 0) return null;

	// Sort by success rate first, then by average latency
	const sorted = [...summaries].sort((a, b) => {
		// If success rates differ by more than 5%, prioritize success rate
		if (Math.abs(a.successRate - b.successRate) > 5) {
			return b.successRate - a.successRate;
		}

		// Otherwise, prioritize latency
		return a.averageLatencyMs - b.averageLatencyMs;
	});

	return sorted[0] ?? null;
}
