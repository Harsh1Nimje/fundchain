import { Campaign } from "@/lib/contract";
import { formatEther } from "ethers";
import { Button } from "@/components/ui/button";
import { Clock, Target, User } from "lucide-react";
import { shortAddr } from "@/lib/web3";

interface Props {
  campaign: Campaign;
  onSelect: (c: Campaign) => void;
}

function timeLeft(deadline: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((diff % 3600) / 60);
  return `${h}h ${m}m left`;
}

export function CampaignCard({ campaign, onSelect }: Props) {
  const goal = Number(formatEther(campaign.goalWei));
  const raised = Number(formatEther(campaign.raisedWei));
  const pct = Math.min(100, goal > 0 ? (raised / goal) * 100 : 0);
  const ended = Date.now() / 1000 >= campaign.deadline;
  const success = campaign.raisedWei >= campaign.goalWei && goal > 0;
  const showStatus = ended || success;

  return (
    <article className="brutal-card p-0 overflow-hidden flex flex-col">
      <div className="relative aspect-[16/10] bg-secondary border-b-2 border-foreground overflow-hidden">
        {campaign.image ? (
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-4xl text-muted-foreground">
            #{campaign.id}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-foreground text-background px-2 py-1 font-mono text-xs">
          ID #{campaign.id}
        </span>
        {showStatus && (
          <span
            className={`absolute top-3 right-3 px-2 py-1 font-mono text-xs border-2 border-foreground ${
              success ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
            }`}
          >
            {success ? "FUNDED" : "FAILED"}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-display text-xl leading-tight line-clamp-2">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>

        <div className="mt-auto space-y-3">
          <div className="h-3 w-full border-2 border-foreground bg-background overflow-hidden">
            <div
              className="h-full bg-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="font-bold">{raised.toFixed(4)} / {goal.toFixed(4)} ETH</span>
            <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground border-t-2 border-dashed border-foreground/20 pt-3">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {shortAddr(campaign.creator)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeLeft(campaign.deadline)}</span>
          </div>

          <Button
            onClick={() => onSelect(campaign)}
            className="w-full bg-foreground text-background hover:bg-highlight hover:text-highlight-foreground rounded-none border-2 border-foreground font-bold uppercase tracking-wider"
          >
            <Target className="mr-2 h-4 w-4" /> View & Back
          </Button>
        </div>
      </div>
    </article>
  );
}
