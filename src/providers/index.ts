/**
 * RPC Provider management
 */
import type { RPCProvider } from "../models/types";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

// Load environment variables
dotenv.config();

// Define provider configuration interface
interface ProviderConfig {
	name: string;
	endpoint: string;
	envKeyPrefix: string;
}

// Load provider configurations from JSON
function loadProviderConfigs(): ProviderConfig[] {
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

// Convert provider configs to RPCProvider objects
function createProviders(configs: ProviderConfig[]): RPCProvider[] {
	return configs.map((config) => {
		const endpoint = process.env[`${config.envKeyPrefix}_RPC_ENDPOINT`] || config.endpoint;
		return {
			name: config.name,
			endpoint,
		};
	});
}

// Default RPC providers using configuration file
export const defaultProviders: RPCProvider[] = createProviders(loadProviderConfigs());

/**
 * Get a provider by name
 */
export function getProviderByName(name: string): RPCProvider | undefined {
	return defaultProviders.find((provider) => provider.name === name);
}

/**
 * Get all available providers
 */
export function getAllProviders(): RPCProvider[] {
	return defaultProviders;
}

/**
 * Get the full RPC URL including API key if needed
 */
export function getProviderUrl(provider: RPCProvider): string {
	return provider.endpoint;
}

/**
 * Add a custom provider at runtime
 */
export function addCustomProvider(provider: RPCProvider): void {
	const existingIndex = defaultProviders.findIndex((p) => p.name === provider.name);
	if (existingIndex >= 0) {
		defaultProviders[existingIndex] = provider;
	} else {
		defaultProviders.push(provider);
	}
}
