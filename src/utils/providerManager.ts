/**
 * Utility functions for managing RPC providers at runtime
 */
import type { RPCProvider } from "../models/types";
import { addCustomProvider, getAllProviders, getProviderByName } from "../providers";
import { isProviderConfigValid } from "./configValidator";
import fs from "node:fs";
import path from "node:path";

// Define provider configuration interface
interface ProviderConfig {
	name: string;
	endpoint: string;
	requiresApiKey: boolean;
	envKeyPrefix: string;
}

/**
 * Add a new provider at runtime
 * @returns true if provider was added successfully, false otherwise
 */
export function addProvider(provider: RPCProvider): boolean {
	if (!isProviderConfigValid(provider)) {
		return false;
	}

	addCustomProvider(provider);
	return true;
}

/**
 * Save a provider to the configuration file
 * @returns true if provider was saved successfully, false otherwise
 */
export function saveProviderToConfig(
	name: string,
	endpoint: string,
	requiresApiKey = false,
	envKeyPrefix?: string
): boolean {
	try {
		const configPath = path.resolve(process.cwd(), "config", "providers.json");
		const configData = fs.readFileSync(configPath, "utf8");
		const config = JSON.parse(configData);

		// Generate a safe env key prefix if not provided
		const safePrefix = envKeyPrefix || name.toUpperCase().replace(/[^A-Z0-9_]/g, "_");

		// Check if provider already exists
		const existingIndex = config.providers.findIndex((p: ProviderConfig) => p.name === name);

		if (existingIndex >= 0) {
			// Update existing provider
			config.providers[existingIndex] = {
				name,
				endpoint,
				requiresApiKey,
				envKeyPrefix: safePrefix,
			};
		} else {
			// Add new provider
			config.providers.push({
				name,
				endpoint,
				requiresApiKey,
				envKeyPrefix: safePrefix,
			});
		}

		// Write updated config back to file
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
		return true;
	} catch (error) {
		console.error("Failed to save provider to configuration:", error);
		return false;
	}
}

/**
 * Remove a provider from the configuration file
 * @returns true if provider was removed successfully, false otherwise
 */
export function removeProviderFromConfig(name: string): boolean {
	try {
		const configPath = path.resolve(process.cwd(), "config", "providers.json");
		const configData = fs.readFileSync(configPath, "utf8");
		const config = JSON.parse(configData);

		// Filter out the provider with the given name
		config.providers = config.providers.filter((p: ProviderConfig) => p.name !== name);

		// Write updated config back to file
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
		return true;
	} catch (error) {
		console.error("Failed to remove provider from configuration:", error);
		return false;
	}
}
