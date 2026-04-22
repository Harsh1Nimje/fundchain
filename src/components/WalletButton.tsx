import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { shortAddr } from "@/lib/web3";
import { Wallet, AlertTriangle } from "lucide-react";

export function WalletButton() {
  const { account, connect, connecting, isSepolia, hasWallet } = useWallet();

  if (!account) {
    return (
      <Button
        onClick={connect}
        disabled={connecting}
        className="bg-accent text-accent-foreground border-2 border-foreground shadow-brutal-sm hover:bg-accent hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal font-bold uppercase tracking-wide rounded-none"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {connecting ? "Connecting…" : hasWallet ? "Connect Wallet" : "Get MetaMask"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isSepolia && (
        <span className="hidden sm:flex items-center gap-1 text-xs font-mono bg-destructive text-destructive-foreground px-2 py-1 border-2 border-foreground">
          <AlertTriangle className="h-3 w-3" /> WRONG NETWORK
        </span>
      )}
      <div className="flex items-center gap-2 bg-foreground text-background px-3 py-2 border-2 border-foreground font-mono text-sm">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse-accent" />
        {shortAddr(account)}
      </div>
    </div>
  );
}
