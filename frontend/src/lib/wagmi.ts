import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { goatNetwork } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Gold Raccoon",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "gold-raccoon-demo",
  chains: [goatNetwork],
  ssr: true,
});
