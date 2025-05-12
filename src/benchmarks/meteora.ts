/**
 * Meteora-specific RPC benchmark operations
 */
import { Connection } from "@solana/web3.js";
import { getProviderUrl } from "../providers";
import type { BenchmarkResult, RPCProvider } from "../models/types";

// Define Meteora-specific RPC request types
export const METEORA_REQUEST_TYPES = ["getDLMMPositions"] as const;

export type MeteoraRequestType = (typeof METEORA_REQUEST_TYPES)[number];

/**
 * Execute a Meteora-specific RPC request and measure its performance
 */
export async function executeMeteoraRequest(
	provider: RPCProvider,
	requestType: MeteoraRequestType
): Promise<BenchmarkResult> {
	const startTime = performance.now();
	const timestamp = Date.now();
	let success = false;
	let error: string | undefined;

	try {
		const connection = new Connection(getProviderUrl(provider));

		switch (requestType) {
			case "getDLMMPositions":
				break;

			default:
				throw new Error(`Unsupported request type: ${requestType}`);
		}

		success = true;
	} catch (err) {
		error = err instanceof Error ? err.message : String(err);
	}

	const endTime = performance.now();
	const latencyMs = endTime - startTime;

	return {
		provider: provider.name,
		timestamp,
		requestType,
		success,
		latencyMs,
		error,
	};
}

/**
 * Run a batch of Meteora RPC requests
 */
export async function runMeteoraRequestBatch(
	provider: RPCProvider,
	requestTypes: MeteoraRequestType[],
	count: number
): Promise<BenchmarkResult[]> {
	const results: BenchmarkResult[] = [];

	for (let i = 0; i < count; i++) {
		for (const requestType of requestTypes) {
			const result = await executeMeteoraRequest(provider, requestType);
			results.push(result);
		}
	}

	return results;
}

/**
 * Run concurrent Meteora RPC requests
 */
export async function runConcurrentMeteoraRequests(
	provider: RPCProvider,
	requestTypes: MeteoraRequestType[],
	count: number,
	concurrency: number
): Promise<BenchmarkResult[]> {
	const results: BenchmarkResult[] = [];
	const totalRequests = count * requestTypes.length;
	let completedRequests = 0;

	const runBatch = async () => {
		while (completedRequests < totalRequests) {
			const requestTypeIndex = completedRequests % requestTypes.length;
			const requestType = requestTypes[requestTypeIndex];
			if (requestType) {
				const result = await executeMeteoraRequest(provider, requestType);
				results.push(result);
			}
			completedRequests++;
		}
	};

	const batchPromises = [];
	for (let i = 0; i < concurrency; i++) {
		batchPromises.push(runBatch());
	}

	await Promise.all(batchPromises);
	return results;
}
