"use client";

import { useAccount } from "wagmi";
import { useStellarWallet } from "@/providers/StellarWalletProvider";

export function useWalletSession() {
  const evm = useAccount();
  const stellar = useStellarWallet();
  const family = stellar.isConnected ? "stellar" : evm.isConnected ? "evm" : null;

  return {
    family,
    address: family === "stellar" ? stellar.address : evm.address,
    chain: family === "stellar" ? stellar.network : evm.chain?.name,
    chainId: family === "evm" ? evm.chainId : undefined,
    isConnected: family !== null,
    isConnecting: stellar.isConnecting || evm.status === "connecting" || evm.status === "reconnecting",
    status: family ? "connected" : stellar.isConnecting || evm.status === "connecting" || evm.status === "reconnecting" ? "connecting" : "disconnected",
    stellar,
    evm,
  } as const;
}
