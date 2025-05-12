/**
 * Types for the benchmark data and RPC providers
 */

export interface RPCProvider {
	name: string;
	endpoint: string;
	apiKey?: string;
}

export interface BenchmarkResult {
	provider: string;
	timestamp: number;
	requestType: string;
	success: boolean;
	latencyMs: number;
	error?: string;
}

export interface BenchmarkSession {
	id: string;
	startTime: number;
	endTime?: number;
	providers: string[];
	results: BenchmarkResult[];
	config: BenchmarkConfig;
}

export interface BenchmarkConfig {
	requestCount: number;
	concurrency: number;
	requestTypes: string[];
	delayBetweenRequestsMs?: number;
}

export interface BenchmarkSummary {
	provider: string;
	successRate: number;
	averageLatencyMs: number;
	p50LatencyMs: number;
	p90LatencyMs: number;
	p99LatencyMs: number;
	minLatencyMs: number;
	maxLatencyMs: number;
	requestCount: number;
	errorCount: number;
}
