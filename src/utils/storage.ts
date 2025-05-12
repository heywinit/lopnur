/**
 * Storage utilities for saving and loading benchmark data
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { BenchmarkResult, BenchmarkSession } from "../models/types";

// Base directory for storing benchmark data
const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
	try {
		await fs.access(DATA_DIR);
	} catch (error) {
		await fs.mkdir(DATA_DIR, { recursive: true });
	}
}

/**
 * Save a benchmark session to a JSON file
 */
export async function saveBenchmarkSession(session: BenchmarkSession): Promise<string> {
	await ensureDataDir();

	const filename = `benchmark-${session.id}.json`;
	const filePath = path.join(DATA_DIR, filename);

	await fs.writeFile(filePath, JSON.stringify(session, null, 2), "utf-8");

	return filePath;
}

/**
 * Load a benchmark session from a JSON file
 */
export async function loadBenchmarkSession(sessionId: string): Promise<BenchmarkSession> {
	const filename = `benchmark-${sessionId}.json`;
	const filePath = path.join(DATA_DIR, filename);

	const data = await fs.readFile(filePath, "utf-8");
	return JSON.parse(data) as BenchmarkSession;
}

/**
 * List all available benchmark sessions
 */
export async function listBenchmarkSessions(): Promise<string[]> {
	await ensureDataDir();

	const files = await fs.readdir(DATA_DIR);
	return files
		.filter((file) => file.startsWith("benchmark-") && file.endsWith(".json"))
		.map((file) => file.replace("benchmark-", "").replace(".json", ""));
}

/**
 * Delete a benchmark session
 */
export async function deleteBenchmarkSession(sessionId: string): Promise<void> {
	const filename = `benchmark-${sessionId}.json`;
	const filePath = path.join(DATA_DIR, filename);

	await fs.unlink(filePath);
}
