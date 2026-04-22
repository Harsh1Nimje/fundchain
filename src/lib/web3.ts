import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI, SEPOLIA_CHAIN_ID } from "./contract";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasMetaMask() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function getProvider(): Promise<BrowserProvider> {
  if (!hasMetaMask()) throw new Error("MetaMask not detected");
  return new BrowserProvider(window.ethereum);
}

export async function ensureSepolia() {
  if (!hasMetaMask()) return;
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current === SEPOLIA_CHAIN_ID) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (err: any) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export async function getSigner(): Promise<JsonRpcSigner> {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  await ensureSepolia();
  return provider.getSigner();
}

export async function getReadContract() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, provider);
}

export async function getWriteContract() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, signer);
}

export function shortAddr(a?: string | null) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
