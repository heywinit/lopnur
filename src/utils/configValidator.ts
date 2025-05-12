/**
 * Utility functions for validating RPC provider configurations
 */
import type { RPCProvider } from "../models/types";
import fs from "node:fs";
import path from "node:path";

// Define provider configuration interface
interface ProviderConfig {
	name: string;
	endpoint: string;
	envKeyPrefix: string;
}

/**
 * Check if a provider has a valid configuration
 */
export function isProviderConfigValid(provider: RPCProvider): boolean {
	// Check if endpoint is provided and is a valid URL
	if (!provider.endpoint || !isValidUrl(provider.endpoint)) {
		return false;
	}

	return true;
}

/**
 * Validate all provider configurations
 */
export function validateProviderConfigs(providers: RPCProvider[]): {
	valid: RPCProvider[];
	invalid: RPCProvider[];
} {
	const valid: RPCProvider[] = [];
	const invalid: RPCProvider[] = [];

	for (const provider of providers) {
		if (isProviderConfigValid(provider)) {
			valid.push(provider);
		} else {
			invalid.push(provider);
		}
	}

	return { valid, invalid };
}

/**
 * Load provider configurations from JSON
 */
export function loadProviderConfigs(): ProviderConfig[] {
	try {
		const configPath = path.resolve(process.cwd(), "config", "providers.json");
		const configData = fs.readFileSync(configPath, "utf8");
		const config = JSON.parse(configData);
		return config.providers || [];
	} catch (error) {
		console.error("Failed to load provider configurations:", error);
		return [];
	}
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
