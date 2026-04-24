import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/WalletButton";
import { CampaignCard } from "@/components/CampaignCard";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignDetailDialog } from "@/components/CampaignDetailDialog";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useWallet } from "@/hooks/useWallet";
import { Campaign, CONTRACT_ADDRESS } from "@/lib/contract";
import { Plus, Zap, ShieldCheck, Layers, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

const Index = () => {
  const { campaigns, loading, error, reload } = useCampaigns();
  const { account, connect } = useWallet();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const notConfigured = CONTRACT_ADDRESS.startsWith("0x0000");

  async function onLaunchClick() {
    if (!account) {
      await connect();
      return;
    }
    setCreateOpen(true);
  }

  return (
    <div className="min-h-screen">
      {/* Marquee */}
      <div className="border-b-2 border-foreground bg-foreground text-background overflow-hidden">
        <div className="flex marquee whitespace-nowrap py-2 font-mono text-xs uppercase tracking-widest">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-6 pr-6 shrink-0">
              {[
                "★ trustless funding",
                "★ on-chain forever",
                "★ powered by ethereum",
                "★ no middlemen",
                "★ refunds if goal fails",
                "★ deploy via remix",
                "★ connect with metamask",
              ].map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <header className="border-b-2 border-foreground bg-background">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 bg-accent border-2 border-foreground flex items-center justify-center font-display">F</span>
            <span className="font-display text-xl tracking-tight">FUNDCHAIN</span>
          </a>
          <WalletButton />
        </div>
      </header>

      {/* Hero */}
      <section className="border-b-2 border-foreground">
        <div className="container py-16 md:py-24 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <span className="inline-block bg-highlight text-highlight-foreground font-mono text-xs px-2 py-1 border-2 border-foreground mb-6">
              SEPOLIA TESTNET · v0.1
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9]">
              Crowdfunding,<br />
              <span className="bg-accent px-2 -mx-2">but trustless.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              Launch a campaign, set a goal, hit a deadline. Funds live in a smart
              contract — not a wallet you have to trust. Backers get refunds if
              the goal isn&apos;t met. No platform fees.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={onLaunchClick}
                className="rounded-none border-2 border-foreground bg-foreground text-background hover:bg-highlight hover:text-highlight-foreground shadow-brutal hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] h-12 px-6 font-bold uppercase tracking-wider"
              >
                <Plus className="mr-2 h-5 w-5" /> Launch a Campaign
              </Button>
              <Button
                onClick={() => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" })}
                variant="outline"
                className="rounded-none border-2 border-foreground bg-background hover:bg-secondary h-12 px-6 font-bold uppercase tracking-wider"
              >
                Browse →
              </Button>
            </div>
          </div>

          <div className="md:col-span-4 brutal-card p-6 bg-card">
            <div className="font-mono text-xs uppercase text-muted-foreground mb-3">// stack</div>
            <ul className="space-y-3 font-mono text-sm">
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-accent-foreground bg-accent p-0.5 border-2 border-foreground" /> MetaMask</li>
              <li className="flex items-center gap-2"><Layers className="h-4 w-4 bg-secondary p-0.5 border-2 border-foreground" /> Solidity ^0.8.20</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 bg-success text-success-foreground p-0.5 border-2 border-foreground" /> ethers.js v6</li>
            </ul>
            <div className="mt-5 pt-5 border-t-2 border-dashed border-foreground/20 text-xs text-muted-foreground">
              Deploy <code className="bg-secondary px-1">contracts/Crowdfunding.sol</code> via Remix → paste address into <code className="bg-secondary px-1">src/lib/contract.ts</code>.
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section id="campaigns" className="container py-16">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase text-muted-foreground">/ all campaigns</div>
            <h2 className="font-display text-4xl md:text-5xl mt-1">Live on-chain.</h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={reload}
              variant="outline"
              className="rounded-none border-2 border-foreground font-mono text-xs uppercase"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Refresh
            </Button>
            <Button
              onClick={onLaunchClick}
              className="rounded-none border-2 border-foreground bg-accent text-accent-foreground hover:bg-accent shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] font-bold uppercase"
            >
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </div>
        </div>

        {notConfigured && (
          <div className="brutal-card p-6 mb-8 bg-highlight text-highlight-foreground">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-bold uppercase tracking-wide">Contract not deployed yet</p>
                <ol className="list-decimal list-inside space-y-1 font-mono text-xs">
                  <li>Open <a href="https://remix.ethereum.org" target="_blank" rel="noreferrer" className="underline">remix.ethereum.org</a></li>
                  <li>Create <code>Crowdfunding.sol</code>, paste the contents of <code>contracts/Crowdfunding.sol</code></li>
                  <li>Compile with Solidity 0.8.20+</li>
                  <li>Deploy with environment <em>Injected Provider · MetaMask</em> on Sepolia</li>
                  <li>Copy the deployed address into <code>src/lib/contract.ts</code> → <code>CONTRACT_ADDRESS</code></li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {error && !notConfigured && (
          <div className="brutal-card p-4 mb-6 bg-destructive text-destructive-foreground font-mono text-xs">
            {error}
          </div>
        )}

        {loading && campaigns.length === 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="brutal-card aspect-[4/5] animate-pulse bg-secondary" />
            ))}
          </div>
        )}

        {!loading && campaigns.length === 0 && !notConfigured && !error && (
          <div className="brutal-card p-12 text-center">
            <p className="font-display text-2xl mb-2">No campaigns yet.</p>
            <p className="text-muted-foreground mb-6">Be the first to launch one on-chain.</p>
            <Button
              onClick={onLaunchClick}
              className="rounded-none border-2 border-foreground bg-foreground text-background hover:bg-highlight hover:text-highlight-foreground font-bold uppercase"
            >
              <Plus className="mr-2 h-4 w-4" /> Launch the first
            </Button>
          </div>
        )}

        {campaigns.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} onSelect={setSelected} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground bg-foreground text-background">
        <div className="container py-8 flex flex-wrap justify-between gap-4 font-mono text-xs uppercase">
          <span>© FUNDCHAIN · trustless by design</span>
          <span>built with metamask · remix · ethers.js</span>
        </div>
      </footer>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={reload} />
      <CampaignDetailDialog campaign={selected} onOpenChange={(o) => !o && setSelected(null)} onChanged={reload} />
    </div>
  );
};

export default Index;
