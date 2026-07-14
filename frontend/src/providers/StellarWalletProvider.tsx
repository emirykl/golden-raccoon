"use client";

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { KitEventType, Networks, SwkAppDarkTheme } from "@creit.tech/stellar-wallets-kit/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getDefaultStellarNetwork, type StellarNetworkId } from "@/lib/stellar/config";

type StellarWalletState = {
  address?: string;
  network: StellarNetworkId;
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  openProfile: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
};

const StellarWalletContext = createContext<StellarWalletState | null>(null);

function kitNetwork(network: StellarNetworkId) {
  return network === "stellar-pubnet" ? Networks.PUBLIC : Networks.TESTNET;
}

function networkFromPassphrase(passphrase: string): StellarNetworkId {
  return passphrase === Networks.PUBLIC ? "stellar-pubnet" : "stellar-testnet";
}

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const configuredNetwork = getDefaultStellarNetwork().id;
  const [address, setAddress] = useState<string>();
  const [network, setNetwork] = useState<StellarNetworkId>(configuredNetwork);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: kitNetwork(configuredNetwork),
      authModal: { hideUnsupportedWallets: false, showInstallLabel: true },
      theme: {
        ...SwkAppDarkTheme,
        primary: "#d9a441",
        "primary-foreground": "#050505",
        background: "#101010",
        "background-secondary": "#050505",
      },
    });

    const stopState = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      setAddress(event.payload.address);
      setNetwork(networkFromPassphrase(event.payload.networkPassphrase));
    });
    const stopDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => setAddress(undefined));

    return () => {
      stopState();
      stopDisconnect();
    };
  }, [configuredNetwork]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(undefined);

    try {
      const result = await StellarWalletsKit.authModal();
      const walletNetwork = await StellarWalletsKit.getNetwork().catch(() => null);
      setAddress(result.address);
      if (walletNetwork?.networkPassphrase) setNetwork(networkFromPassphrase(walletNetwork.networkPassphrase));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Stellar wallet connection was cancelled.";
      setError(message);
      throw cause;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    setAddress(undefined);
    setError(undefined);
  }, []);

  const openProfile = useCallback(async () => {
    await StellarWalletsKit.profileModal();
  }, []);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("Connect a Stellar wallet before signing.");
      const result = await StellarWalletsKit.signTransaction(xdr, {
        address,
        networkPassphrase: kitNetwork(network),
      });

      return result.signedTxXdr;
    },
    [address, network],
  );

  const value = useMemo<StellarWalletState>(
    () => ({
      address,
      network,
      isConnected: Boolean(address),
      isConnecting,
      error,
      connect,
      disconnect,
      openProfile,
      signTransaction,
    }),
    [address, network, isConnecting, error, connect, disconnect, openProfile, signTransaction],
  );

  return <StellarWalletContext.Provider value={value}>{children}</StellarWalletContext.Provider>;
}

export function useStellarWallet() {
  const context = useContext(StellarWalletContext);

  if (!context) throw new Error("useStellarWallet must be used inside StellarWalletProvider.");

  return context;
}
