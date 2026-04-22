import { useCallback, useEffect, useState } from "react";
import { ensureSepolia, hasMetaMask, getProvider } from "@/lib/web3";
import { SEPOLIA_CHAIN_ID } from "@/lib/contract";

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasMetaMask()) return;
    try {
      const provider = await getProvider();
      const accounts = await provider.send("eth_accounts", []);
      const net = await window.ethereum.request({ method: "eth_chainId" });
      setAccount(accounts[0] ?? null);
      setChainId(net);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!hasMetaMask()) return;
    const onAccounts = (a: string[]) => setAccount(a[0] ?? null);
    const onChain = (c: string) => setChainId(c);
    window.ethereum.on?.("accountsChanged", onAccounts);
    window.ethereum.on?.("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccounts);
      window.ethereum.removeListener?.("chainChanged", onChain);
    };
  }, [refresh]);

  const connect = useCallback(async () => {
    if (!hasMetaMask()) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const provider = await getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      await ensureSepolia();
      setAccount(accounts[0] ?? null);
      const net = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(net);
    } finally {
      setConnecting(false);
    }
  }, []);

  return {
    account,
    chainId,
    connecting,
    connect,
    isSepolia: chainId === SEPOLIA_CHAIN_ID,
    hasWallet: hasMetaMask(),
  };
}
