import { defineChain } from "viem";

export const goatNetwork = defineChain({
  id: 48816,
  name: "GOAT Network",
  nativeCurrency: {
    decimals: 18,
    name: "GOAT",
    symbol: "GOAT",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_GOAT_RPC_URL ?? "https://rpc.goat.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "GOAT Explorer",
      url: process.env.NEXT_PUBLIC_GOAT_EXPLORER_URL ?? "https://explorer.goat.network",
    },
  },
});
