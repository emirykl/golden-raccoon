import { Networks, StrKey } from "@stellar/stellar-sdk";

export type StellarNetworkId = "stellar-testnet" | "stellar-pubnet";

export type StellarNetworkConfig = {
  id: StellarNetworkId;
  name: string;
  shortName: "testnet" | "pubnet";
  caip2: "stellar:testnet" | "stellar:pubnet";
  networkPassphrase: string;
  rpcUrl: string;
  rpcUrls: readonly string[];
  dataApiUrl: string;
  dataApiUrls: readonly string[];
  explorerUrl: string;
  x402UsdcContract: string;
  registryContractId?: string;
  expectedProtocolVersion: number;
};

const testnetRpcUrl = process.env.NEXT_PUBLIC_STELLAR_TESTNET_RPC_URL ?? "https://soroban-testnet.stellar.org";
const pubnetRpcUrl = process.env.NEXT_PUBLIC_STELLAR_PUBNET_RPC_URL ?? "https://mainnet.sorobanrpc.com";

function splitUrls(value?: string) {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
}

function uniqueUrls(primary: string, configured: string | undefined, defaults: string[]) {
  return [...new Set([primary, ...splitUrls(configured), ...defaults])];
}

const testnetDataApiUrl = process.env.NEXT_PUBLIC_STELLAR_TESTNET_DATA_API_URL ?? "https://horizon-testnet.stellar.org";
const pubnetDataApiUrl = process.env.NEXT_PUBLIC_STELLAR_PUBNET_DATA_API_URL ?? "https://horizon.stellar.org";

export const stellarNetworks: Record<StellarNetworkId, StellarNetworkConfig> = {
  "stellar-testnet": {
    id: "stellar-testnet",
    name: "Stellar Testnet",
    shortName: "testnet",
    caip2: "stellar:testnet",
    networkPassphrase: Networks.TESTNET,
    rpcUrl: testnetRpcUrl,
    rpcUrls: uniqueUrls(testnetRpcUrl, process.env.NEXT_PUBLIC_STELLAR_TESTNET_RPC_FALLBACK_URLS, ["https://soroban-rpc.testnet.stellar.gateway.fm"]),
    dataApiUrl: testnetDataApiUrl,
    dataApiUrls: uniqueUrls(testnetDataApiUrl, process.env.NEXT_PUBLIC_STELLAR_TESTNET_DATA_API_FALLBACK_URLS, []),
    explorerUrl: process.env.NEXT_PUBLIC_STELLAR_TESTNET_EXPLORER_URL ?? "https://stellar.expert/explorer/testnet",
    x402UsdcContract: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    registryContractId: process.env.NEXT_PUBLIC_STELLAR_TESTNET_RISK_REGISTRY_CONTRACT_ID ?? process.env.NEXT_PUBLIC_STELLAR_RISK_REGISTRY_CONTRACT_ID,
    expectedProtocolVersion: 27,
  },
  "stellar-pubnet": {
    id: "stellar-pubnet",
    name: "Stellar Pubnet",
    shortName: "pubnet",
    caip2: "stellar:pubnet",
    networkPassphrase: Networks.PUBLIC,
    rpcUrl: pubnetRpcUrl,
    rpcUrls: uniqueUrls(pubnetRpcUrl, process.env.NEXT_PUBLIC_STELLAR_PUBNET_RPC_FALLBACK_URLS, ["https://soroban-rpc.mainnet.stellar.gateway.fm"]),
    dataApiUrl: pubnetDataApiUrl,
    dataApiUrls: uniqueUrls(pubnetDataApiUrl, process.env.NEXT_PUBLIC_STELLAR_PUBNET_DATA_API_FALLBACK_URLS, ["https://horizon.stellar.lobstr.co"]),
    explorerUrl: process.env.NEXT_PUBLIC_STELLAR_PUBNET_EXPLORER_URL ?? "https://stellar.expert/explorer/public",
    x402UsdcContract: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    registryContractId: process.env.NEXT_PUBLIC_STELLAR_PUBNET_RISK_REGISTRY_CONTRACT_ID ?? process.env.NEXT_PUBLIC_STELLAR_RISK_REGISTRY_CONTRACT_ID,
    expectedProtocolVersion: 26,
  },
};

export function normalizeStellarNetworkId(value?: string): StellarNetworkId | null {
  const normalized = value?.trim().toLowerCase();

  if (["stellar", "stellar-testnet", "stellar:testnet", "testnet"].includes(normalized ?? "")) return "stellar-testnet";
  if (["stellar-pubnet", "stellar:pubnet", "stellar-mainnet", "pubnet"].includes(normalized ?? "")) return "stellar-pubnet";

  return null;
}

export function getStellarNetwork(value?: string) {
  const id = normalizeStellarNetworkId(value);

  return id ? stellarNetworks[id] : null;
}

export function getDefaultStellarNetwork() {
  return assertStellarNetworkConfig(getStellarNetwork(process.env.NEXT_PUBLIC_STELLAR_NETWORK) ?? stellarNetworks["stellar-testnet"]);
}

export function getStellarRpcUrls(network: StellarNetworkConfig) {
  const primary = (network.id === "stellar-pubnet" ? process.env.STELLAR_PUBNET_RPC_URL : process.env.STELLAR_TESTNET_RPC_URL)?.trim()
    ?? (network.id === getStellarNetwork(process.env.NEXT_PUBLIC_STELLAR_NETWORK)?.id ? process.env.STELLAR_RPC_URL?.trim() : undefined);
  const fallbacks = splitUrls(network.id === "stellar-pubnet" ? process.env.STELLAR_PUBNET_RPC_FALLBACK_URLS : process.env.STELLAR_TESTNET_RPC_FALLBACK_URLS);
  const legacyFallbacks = network.id === getStellarNetwork(process.env.NEXT_PUBLIC_STELLAR_NETWORK)?.id ? splitUrls(process.env.STELLAR_RPC_FALLBACK_URLS) : [];

  return [...new Set([primary, ...fallbacks, ...legacyFallbacks, ...network.rpcUrls].filter((value): value is string => Boolean(value)))];
}

export function getStellarDataApiUrls(network: StellarNetworkConfig) {
  const primary = (network.id === "stellar-pubnet" ? process.env.STELLAR_PUBNET_DATA_API_URL : process.env.STELLAR_TESTNET_DATA_API_URL)?.trim()
    ?? (network.id === getStellarNetwork(process.env.NEXT_PUBLIC_STELLAR_NETWORK)?.id ? process.env.STELLAR_DATA_API_URL?.trim() : undefined);
  const fallbacks = splitUrls(network.id === "stellar-pubnet" ? process.env.STELLAR_PUBNET_DATA_API_FALLBACK_URLS : process.env.STELLAR_TESTNET_DATA_API_FALLBACK_URLS);
  const legacyFallbacks = network.id === getStellarNetwork(process.env.NEXT_PUBLIC_STELLAR_NETWORK)?.id ? splitUrls(process.env.STELLAR_DATA_API_FALLBACK_URLS) : [];

  return [...new Set([primary, ...fallbacks, ...legacyFallbacks, ...network.dataApiUrls].filter((value): value is string => Boolean(value)))];
}

export function getStellarRegistryContractId(network: StellarNetworkConfig) {
  return (network.id === "stellar-pubnet" ? process.env.STELLAR_PUBNET_RISK_REGISTRY_ID : process.env.STELLAR_TESTNET_RISK_REGISTRY_ID)?.trim()
    || network.registryContractId;
}

export function validateStellarNetworkConfig(network: StellarNetworkConfig, options: { requireRegistry?: boolean } = {}) {
  const issues: string[] = [];
  const expectedPassphrase = network.id === "stellar-pubnet" ? Networks.PUBLIC : Networks.TESTNET;

  if (network.networkPassphrase !== expectedPassphrase) issues.push(`${network.id} network passphrase mismatch.`);
  if (network.caip2 !== (network.id === "stellar-pubnet" ? "stellar:pubnet" : "stellar:testnet")) issues.push(`${network.id} CAIP-2 identifier mismatch.`);
  if (getStellarRpcUrls(network).length < 2) issues.push(`${network.id} requires primary and fallback RPC providers.`);

  for (const [label, urls] of [["RPC", getStellarRpcUrls(network)], ["data API", getStellarDataApiUrls(network)]] as const) {
    for (const value of urls) {
      try {
        if (new URL(value).protocol !== "https:") issues.push(`${network.id} ${label} URL must use HTTPS: ${value}`);
      } catch {
        issues.push(`${network.id} ${label} URL is invalid: ${value}`);
      }
    }
  }

  if (!StrKey.isValidContract(network.x402UsdcContract)) issues.push(`${network.id} USDC contract ID is invalid.`);
  const registryContractId = getStellarRegistryContractId(network);
  if (registryContractId && !StrKey.isValidContract(registryContractId)) issues.push(`${network.id} registry contract ID is invalid.`);
  if (options.requireRegistry && !registryContractId) issues.push(`${network.id} registry contract ID is required.`);

  return { ok: issues.length === 0, issues };
}

export function assertStellarNetworkConfig(network: StellarNetworkConfig, options: { requireRegistry?: boolean } = {}) {
  const validation = validateStellarNetworkConfig(network, options);
  if (!validation.ok) throw new Error(`Invalid Stellar configuration: ${validation.issues.join(" ")}`);
  return network;
}
