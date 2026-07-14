"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Orbit, Wallet, X } from "lucide-react";
import { useStellarWallet } from "@/providers/StellarWalletProvider";

export function WalletConnectButton() {
  const stellar = useStellarWallet();
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);

  if (stellar.isConnected) {
    return (
      <button
        type="button"
        onClick={() => void stellar.openProfile()}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#7b61ff]/35 bg-[#7b61ff]/10 px-5 text-sm font-medium text-white transition hover:bg-[#7b61ff]/20"
      >
        <Orbit className="h-4 w-4 text-[#a99aff]" />
        {stellar.address?.slice(0, 5)}...{stellar.address?.slice(-4)}
      </button>
    );
  }

  return (
    <div className="relative">
      <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, mounted }) => {
        const connected = mounted && account && chain;

        if (!connected) {
          return (
            <button
              type="button"
              onClick={() => setIsChoiceOpen((value) => !value)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d9a441] px-5 text-sm font-semibold text-black transition hover:bg-[#f2c86d]"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className="inline-flex h-11 items-center justify-center rounded-full bg-red-500 px-5 text-sm font-semibold text-white"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 text-sm font-medium text-white transition hover:bg-white/12"
          >
            {account.displayName}
          </button>
        );
      }}
      </ConnectButton.Custom>
      {isChoiceOpen ? (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-white/12 bg-[#101010] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
            Select network
            <button type="button" onClick={() => setIsChoiceOpen(false)} aria-label="Close wallet selector"><X className="h-4 w-4" /></button>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button type="button" onClick={() => { setIsChoiceOpen(false); openConnectModal(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/8">
                <Wallet className="h-5 w-5 text-[#d9a441]" /> EVM wallet
              </button>
            )}
          </ConnectButton.Custom>
          <button type="button" disabled={stellar.isConnecting} onClick={() => { setIsChoiceOpen(false); void stellar.connect().catch(() => undefined); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white hover:bg-white/8 disabled:opacity-50">
            <Orbit className="h-5 w-5 text-[#a99aff]" /> {stellar.isConnecting ? "Connecting..." : "Stellar wallet"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
