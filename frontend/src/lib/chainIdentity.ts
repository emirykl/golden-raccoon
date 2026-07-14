import { StrKey } from "@stellar/stellar-sdk";
import { isAddress as isEvmAddress } from "viem";

export type ChainFamily = "evm" | "stellar";

export type StellarAddressKind = "account" | "contract" | "muxed_account";

export function getChainFamily(chain?: string): ChainFamily {
  const normalized = chain?.trim().toLowerCase() ?? "";

  return normalized === "stellar" || normalized.startsWith("stellar-") || normalized.startsWith("stellar:")
    ? "stellar"
    : "evm";
}

export function getStellarAddressKind(value?: string): StellarAddressKind | null {
  const candidate = value?.trim() ?? "";

  if (StrKey.isValidEd25519PublicKey(candidate)) return "account";
  if (StrKey.isValidContract(candidate)) return "contract";
  if (StrKey.isValidMed25519PublicKey(candidate)) return "muxed_account";

  return null;
}

export function isStellarAccountAddress(value?: string) {
  return getStellarAddressKind(value) === "account";
}

export function isStellarContractAddress(value?: string) {
  return getStellarAddressKind(value) === "contract";
}

export function isStellarAddress(value?: string) {
  return getStellarAddressKind(value) !== null;
}

export function isWalletAddressForChain(value: string | undefined, chain?: string) {
  return getChainFamily(chain) === "stellar" ? isStellarAccountAddress(value) : Boolean(value && isEvmAddress(value));
}

export function isContractAddressForChain(value: string | undefined, chain?: string) {
  return getChainFamily(chain) === "stellar" ? isStellarContractAddress(value) : Boolean(value && isEvmAddress(value));
}

export function canonicalizeAddress(value: string, family: ChainFamily) {
  const trimmed = value.trim();

  return family === "evm" ? trimmed.toLowerCase() : trimmed.toUpperCase();
}

export function isTransactionHashForChain(value: string, family: ChainFamily) {
  return family === "evm" ? /^0x[a-fA-F0-9]{64}$/.test(value) : /^[a-fA-F0-9]{64}$/.test(value);
}
