export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export function shortNetworkName(network: string): string {
  if (network.includes("testnet")) return "testnet";
  if (network.includes("mainnet")) return "mainnet";
  return "custom";
}
