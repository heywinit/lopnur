# Lopnur

A tool for benchmarking various Solana RPC Providers for Meteora and its programs.

Lopnur helps you compare different Solana RPC providers to determine which one offers the best performance and reliability for Meteora-specific operations.

## Features

- Benchmark multiple RPC providers simultaneously
- Test specific Meteora operations like pool and position queries
- Measure latency and success rates
- Generate detailed performance reports
- JSON-based storage for easy analysis and comparison
- Configurable concurrency and request counts
- Secure provider configuration via JSON and environment variables

## Installation

```bash
# Clone the repository
git clone https://github.com/heywinit/lopnur.git
cd lopnur

# Install dependencies
bun install

# Make the CLI executable
chmod +x bin/lopnur.ts
```

## Usage

### Basic Usage

```bash
# Run with default settings
bun run bin/lopnur.ts

# Or use the CLI directly
./bin/lopnur.ts
```

### Advanced Options

```bash
# Run 20 requests per type with 5 concurrent requests
./bin/lopnur.ts --count 20 --concurrency 5

# Test only specific Meteora operations
./bin/lopnur.ts --types getDLMMPools,getDLMMPositions

# Show help
./bin/lopnur.ts --help
```

## Configuration

Lopnur uses a combination of a JSON configuration file and environment variables for secure RPC provider management:

1. **Provider Configuration**: RPC providers are defined in `config/providers.json`
2. **API Keys and Endpoints**: Sensitive information is stored in environment variables

### Setting Up Providers

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual API keys:
   ```
   HELIUS_API_KEY=your-actual-api-key
   ```

3. Customize providers in `config/providers.json` if needed.

### Adding Custom Providers

To add a custom provider at runtime:

```typescript
import { addProvider } from "./src/utils/providerManager";

addProvider({
  name: "Custom Provider",
  endpoint: "https://custom-provider.com",
  apiKey: "your-api-key"
});
```

To permanently add a provider to the configuration:

```typescript
import { saveProviderToConfig } from "./src/utils/providerManager";

saveProviderToConfig(
  "Custom Provider",
  "https://custom-provider.com",
  true, // requires API key
  "CUSTOM" // environment variable prefix
);
```

## Development

```bash
# Run in development mode with auto-reload
bun run dev

# Lint the code
bun run lint

# Format the code
bun run format

# Run tests
bun run test
```

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.
