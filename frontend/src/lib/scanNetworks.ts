export type ScanNetwork = {
  id: string;
  name: string;
  mark: string;
  color: string;
  aliases?: string[];
  goPlusChainId?: string;
  dexScreenerChainId: string;
  covalentChainId?: string;
  rpcUrl?: string;
};

export const scanNetworks: ScanNetwork[] = [
  { id: "goat", name: "GOAT", mark: "G", color: "bg-[#d9a441] text-black", aliases: ["goat-mainnet"], dexScreenerChainId: "goat" },
  { id: "ethereum", name: "Ethereum", mark: "E", color: "bg-[#627eea] text-white", aliases: ["eth", "eth-mainnet"], goPlusChainId: "1", dexScreenerChainId: "ethereum", covalentChainId: "eth-mainnet", rpcUrl: "https://ethereum-rpc.publicnode.com" },
  { id: "base", name: "Base", mark: "B", color: "bg-[#0052ff] text-white", aliases: ["base-mainnet"], goPlusChainId: "8453", dexScreenerChainId: "base", covalentChainId: "base-mainnet", rpcUrl: "https://mainnet.base.org" },
  { id: "bsc", name: "BNB Chain", mark: "B", color: "bg-[#f3ba2f] text-black", aliases: ["bnb", "bnb chain", "bsc-mainnet"], goPlusChainId: "56", dexScreenerChainId: "bsc", covalentChainId: "bsc-mainnet", rpcUrl: "https://bsc-dataseed.binance.org" },
  { id: "arbitrum", name: "Arbitrum", mark: "A", color: "bg-[#213147] text-white", aliases: ["arbitrum-mainnet"], goPlusChainId: "42161", dexScreenerChainId: "arbitrum", covalentChainId: "arbitrum-mainnet", rpcUrl: "https://arb1.arbitrum.io/rpc" },
  { id: "polygon", name: "Polygon", mark: "P", color: "bg-[#8247e5] text-white", aliases: ["matic", "matic-mainnet"], goPlusChainId: "137", dexScreenerChainId: "polygon", covalentChainId: "matic-mainnet", rpcUrl: "https://polygon-bor-rpc.publicnode.com" },
  { id: "optimism", name: "Optimism", mark: "O", color: "bg-[#ff0420] text-white", aliases: ["optimism-mainnet"], goPlusChainId: "10", dexScreenerChainId: "optimism", covalentChainId: "optimism-mainnet", rpcUrl: "https://mainnet.optimism.io" },
  { id: "avalanche", name: "Avalanche", mark: "A", color: "bg-[#e84142] text-white", aliases: ["avalanche-mainnet"], goPlusChainId: "43114", dexScreenerChainId: "avalanche", covalentChainId: "avalanche-mainnet", rpcUrl: "https://api.avax.network/ext/bc/C/rpc" },
  { id: "linea", name: "Linea", mark: "L", color: "bg-[#61dfff] text-black", aliases: ["linea-mainnet"], goPlusChainId: "59144", dexScreenerChainId: "linea", covalentChainId: "linea-mainnet", rpcUrl: "https://rpc.linea.build" },
  { id: "scroll", name: "Scroll", mark: "S", color: "bg-[#ffeeda] text-black", aliases: ["scroll-mainnet"], goPlusChainId: "534352", dexScreenerChainId: "scroll", covalentChainId: "scroll-mainnet", rpcUrl: "https://rpc.scroll.io" },
  { id: "zksync", name: "zkSync Era", mark: "Z", color: "bg-[#4e529a] text-white", aliases: ["zksync-mainnet"], goPlusChainId: "324", dexScreenerChainId: "zksync", covalentChainId: "zksync-mainnet", rpcUrl: "https://mainnet.era.zksync.io" },
  { id: "opbnb", name: "opBNB", mark: "O", color: "bg-[#f0b90b] text-black", goPlusChainId: "204", dexScreenerChainId: "opbnb", covalentChainId: "opbnb-mainnet", rpcUrl: "https://opbnb-mainnet-rpc.bnbchain.org" },
  { id: "mantle", name: "Mantle", mark: "M", color: "bg-white text-black", aliases: ["mantle-mainnet"], goPlusChainId: "5000", dexScreenerChainId: "mantle", covalentChainId: "mantle-mainnet", rpcUrl: "https://rpc.mantle.xyz" },
  { id: "blast", name: "Blast", mark: "B", color: "bg-[#fcfc03] text-black", aliases: ["blast-mainnet"], goPlusChainId: "81457", dexScreenerChainId: "blast", covalentChainId: "blast-mainnet", rpcUrl: "https://rpc.blast.io" },
  { id: "fantom", name: "Fantom", mark: "F", color: "bg-[#1969ff] text-white", aliases: ["fantom-mainnet"], goPlusChainId: "250", dexScreenerChainId: "fantom", covalentChainId: "fantom-mainnet", rpcUrl: "https://rpcapi.fantom.network" },
  { id: "gnosis", name: "Gnosis", mark: "G", color: "bg-[#04795b] text-white", aliases: ["gnosis-mainnet"], goPlusChainId: "100", dexScreenerChainId: "gnosischain", covalentChainId: "gnosis-mainnet", rpcUrl: "https://rpc.gnosischain.com" },
  { id: "celo", name: "Celo", mark: "C", color: "bg-[#35d07f] text-black", aliases: ["celo-mainnet"], goPlusChainId: "42220", dexScreenerChainId: "celo", covalentChainId: "celo-mainnet", rpcUrl: "https://forno.celo.org" },
  { id: "moonbeam", name: "Moonbeam", mark: "M", color: "bg-[#53cbc9] text-black", aliases: ["moonbeam-mainnet"], goPlusChainId: "1284", dexScreenerChainId: "moonbeam", covalentChainId: "moonbeam-mainnet", rpcUrl: "https://rpc.api.moonbeam.network" },
  { id: "moonriver", name: "Moonriver", mark: "M", color: "bg-[#f2b705] text-black", aliases: ["moonriver-mainnet"], goPlusChainId: "1285", dexScreenerChainId: "moonriver", covalentChainId: "moonriver-mainnet", rpcUrl: "https://rpc.api.moonriver.moonbeam.network" },
  { id: "berachain", name: "Berachain", mark: "B", color: "bg-[#ffb13b] text-black", aliases: ["berachain-mainnet"], goPlusChainId: "80094", dexScreenerChainId: "berachain", covalentChainId: "berachain-mainnet", rpcUrl: "https://rpc.berachain.com" },
  { id: "sonic", name: "Sonic", mark: "S", color: "bg-[#1f6bff] text-white", aliases: ["sonic-mainnet"], goPlusChainId: "146", dexScreenerChainId: "sonic", covalentChainId: "sonic-mainnet", rpcUrl: "https://rpc.soniclabs.com" },
  { id: "unichain", name: "Unichain", mark: "U", color: "bg-[#ff37c7] text-black", aliases: ["unichain-mainnet"], goPlusChainId: "130", dexScreenerChainId: "unichain", covalentChainId: "unichain-mainnet", rpcUrl: "https://mainnet.unichain.org" },
  { id: "worldchain", name: "World Chain", mark: "W", color: "bg-white text-black", aliases: ["world-chain", "worldchain-mainnet"], goPlusChainId: "480", dexScreenerChainId: "worldchain", covalentChainId: "world-chain-mainnet", rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public" },
  { id: "monad", name: "Monad", mark: "M", color: "bg-[#836ef9] text-white", aliases: ["monad-mainnet"], goPlusChainId: "143", dexScreenerChainId: "monad", covalentChainId: "monad-mainnet", rpcUrl: "https://rpc.monad.xyz" },
  { id: "plasma", name: "Plasma", mark: "P", color: "bg-[#37e8a4] text-black", aliases: ["plasma-mainnet"], goPlusChainId: "9745", dexScreenerChainId: "plasma", covalentChainId: "plasma-mainnet", rpcUrl: "https://rpc.plasma.to" },
];

export function normalizeScanNetworkId(value?: string) {
  const normalized = (value ?? "").trim().toLowerCase();
  const network = scanNetworks.find((candidate) => candidate.id === normalized || candidate.aliases?.includes(normalized));

  return network?.id ?? normalized.replace("-mainnet", "");
}

export function getScanNetwork(value?: string) {
  const id = normalizeScanNetworkId(value);

  return scanNetworks.find((network) => network.id === id);
}
