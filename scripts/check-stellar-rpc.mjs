const networks = [
  {
    id: "stellar-testnet",
    passphrase: "Test SDF Network ; September 2015",
    minimumProtocolVersion: 27,
    providers: [
      process.env.STELLAR_TESTNET_RPC_URL || "https://soroban-testnet.stellar.org",
      ...(process.env.STELLAR_TESTNET_RPC_FALLBACK_URLS || "https://soroban-rpc.testnet.stellar.gateway.fm").split(","),
    ],
  },
  {
    id: "stellar-pubnet",
    passphrase: "Public Global Stellar Network ; September 2015",
    minimumProtocolVersion: 26,
    providers: [
      process.env.STELLAR_PUBNET_RPC_URL || "https://mainnet.sorobanrpc.com",
      ...(process.env.STELLAR_PUBNET_RPC_FALLBACK_URLS || "https://soroban-rpc.mainnet.stellar.gateway.fm").split(","),
    ],
  },
];

async function checkProvider(network, provider) {
  const response = await fetch(provider.trim(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getNetwork" }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${provider} returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error || !payload.result) throw new Error(`${provider} returned an invalid RPC response`);
  if (payload.result.passphrase !== network.passphrase) throw new Error(`${provider} serves the wrong Stellar network`);
  if (payload.result.protocolVersion < network.minimumProtocolVersion) throw new Error(`${provider} protocol ${payload.result.protocolVersion} is below ${network.minimumProtocolVersion}`);
  return { provider: provider.trim(), protocolVersion: payload.result.protocolVersion };
}

for (const network of networks) {
  const providers = [...new Set(network.providers.map((value) => value.trim()).filter(Boolean))];
  if (providers.length < 2 || new Set(providers.map((value) => new URL(value).hostname)).size < 2) {
    throw new Error(`${network.id} requires two independent RPC provider hosts`);
  }
  const results = await Promise.all(providers.map((provider) => checkProvider(network, provider)));
  console.log(`${network.id}: ${results.map((result) => `${new URL(result.provider).hostname} protocol ${result.protocolVersion}`).join(", ")}`);
}

console.log("Stellar live RPC checks passed.");
