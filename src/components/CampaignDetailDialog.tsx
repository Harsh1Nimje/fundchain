import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/lib/contract";
import { formatEther, parseEther } from "ethers";
import { getWriteContract, shortAddr } from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { Loader2, HandCoins, ArrowDownToLine, RotateCcw, ExternalLink } from "lucide-react";

interface Props {
  campaign: Campaign | null;
  onOpenChange: (o: boolean) => void;
  onChanged: () => void;
}

export function CampaignDetailDialog({ campaign, onOpenChange, onChanged }: Props) {
  const { account } = useWallet();
  const [amount, setAmount] = useState("0.01");
  const [busy, setBusy] = useState<string | null>(null);

  if (!campaign) return null;

  const goal = Number(formatEther(campaign.goalWei));
  const raised = Number(formatEther(campaign.raisedWei));
  const pct = Math.min(100, goal > 0 ? (raised / goal) * 100 : 0);
  const ended = Date.now() / 1000 >= campaign.deadline;
  const goalReached = campaign.raisedWei >= campaign.goalWei && goal > 0;
  const success = goalReached;
  const failed = ended && !goalReached;
  const isCreator = account?.toLowerCase() === campaign.creator.toLowerCase();

  async function run(label: string, fn: () => Promise<any>) {
    setBusy(label);
    try {
      const tx = await fn();
      toast.loading("Mining transaction…", { id: label });
      await tx.wait();
      toast.success("Confirmed on-chain ✓", { id: label });
      onChanged();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.shortMessage ?? err?.message ?? "Failed", { id: label });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={!!campaign} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-brutal-lg max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl pr-6">{campaign.title}</DialogTitle>
          <DialogDescription className="font-mono text-xs flex items-center gap-2">
            By {shortAddr(campaign.creator)}
            <a
              href={`https://sepolia.etherscan.io/address/${campaign.creator}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              etherscan <ExternalLink className="h-3 w-3" />
            </a>
          </DialogDescription>
        </DialogHeader>

        {campaign.image && (
          <div className="border-2 border-foreground aspect-[16/9] overflow-hidden">
            <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-sm text-foreground/80 whitespace-pre-line">{campaign.description}</p>

        <div className="space-y-2">
          <div className="h-4 w-full border-2 border-foreground bg-background overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between font-mono text-xs">
            <span className="font-bold">{raised.toFixed(4)} / {goal.toFixed(4)} ETH</span>
            <span className={success ? "text-success" : failed ? "text-destructive" : ""}>
              {success ? "GOAL REACHED" : failed ? "FAILED" : `${pct.toFixed(0)}%`}
            </span>
          </div>
        </div>

        {!ended && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="amt" className="font-mono text-xs uppercase">Contribute (ETH)</Label>
              <Input
                id="amt" type="number" step="0.001" min="0.001" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-none border-2 border-foreground"
              />
            </div>
            <Button
              disabled={!!busy}
              onClick={() => run("contribute", async () => {
                const c = await getWriteContract();
                return c.contribute(campaign.id, { value: parseEther(amount || "0") });
              })}
              className="rounded-none border-2 border-foreground bg-accent text-accent-foreground hover:bg-accent shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] font-bold uppercase"
            >
              {busy === "contribute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCoins className="h-4 w-4 mr-1" />}
              Back it
            </Button>
          </div>
        )}

        {success && isCreator && !campaign.withdrawn && (
          <Button
            disabled={!!busy}
            onClick={() => run("withdraw", async () => {
              const c = await getWriteContract();
              return c.withdraw(campaign.id);
            })}
            className="rounded-none border-2 border-foreground bg-success text-success-foreground hover:bg-success font-bold uppercase"
          >
            {busy === "withdraw" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownToLine className="h-4 w-4 mr-2" />}
            Withdraw funds
          </Button>
        )}

        {failed && (
          <Button
            disabled={!!busy}
            onClick={() => run("refund", async () => {
              const c = await getWriteContract();
              return c.refund(campaign.id);
            })}
            variant="outline"
            className="rounded-none border-2 border-foreground font-bold uppercase"
          >
            {busy === "refund" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Claim refund
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
