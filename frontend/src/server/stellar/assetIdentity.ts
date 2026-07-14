import { Asset, StrKey } from "@stellar/stellar-sdk";
import { getStellarNetwork } from "@/lib/stellar/config";

export type StellarAssetIdentity =
  | {
      type: "native";
      assetKey: "native";
      symbol: "XLM";
      name: "Stellar Lumens";
      contractId: string;
    }
  | {
      type: "classic";
      assetKey: string;
      symbol: string;
      issuer: string;
      contractId: string;
    }
  | {
      type: "contract";
      assetKey: string;
      contractId: string;
    }
  | {
      type: "issuer_account";
      assetKey: string;
      issuer: string;
    };

const assetCodePattern = /^[a-zA-Z0-9]{1,12}$/;

export function canonicalClassicAssetKey(code: string, issuer: string) {
  return `classic:${code.trim().toUpperCase()}:${issuer.trim().toUpperCase()}`;
}

export function canonicalContractAssetKey(contractId: string) {
  return `contract:${contractId.trim().toUpperCase()}`;
}

export function parseStellarAssetInput(query: string, networkId: string): StellarAssetIdentity | null {
  const network = getStellarNetwork(networkId);
  if (!network) throw new Error(`Unsupported Stellar network: ${networkId}`);
  const trimmed = query.trim();

  if (["xlm", "native", "stellar:xlm"].includes(trimmed.toLowerCase())) {
    return {
      type: "native",
      assetKey: "native",
      symbol: "XLM",
      name: "Stellar Lumens",
      contractId: Asset.native().contractId(network.networkPassphrase),
    };
  }

  if (StrKey.isValidContract(trimmed)) {
    const contractId = trimmed.toUpperCase();

    return {
      type: "contract",
      assetKey: canonicalContractAssetKey(contractId),
      contractId,
    };
  }

  if (StrKey.isValidEd25519PublicKey(trimmed)) {
    const issuer = trimmed.toUpperCase();

    return {
      type: "issuer_account",
      assetKey: `issuer:${issuer}`,
      issuer,
    };
  }

  const separator = trimmed.indexOf(":");

  if (separator <= 0) return null;

  const code = trimmed.slice(0, separator).toUpperCase();
  const issuer = trimmed.slice(separator + 1).toUpperCase();

  if (!assetCodePattern.test(code) || !StrKey.isValidEd25519PublicKey(issuer)) return null;

  const asset = new Asset(code, issuer);

  return {
    type: "classic",
    assetKey: canonicalClassicAssetKey(code, issuer),
    symbol: code,
    issuer,
    contractId: asset.contractId(network.networkPassphrase),
  };
}
