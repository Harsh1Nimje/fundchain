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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getWriteContract } from "@/lib/web3";
import { parseEther } from "ethers";
import { toast } from "sonner";
import { Loader2, Rocket } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}

export function CreateCampaignDialog({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const contract = await getWriteContract();
      const goalWei = parseEther(goal || "0");
      const deadline = Math.floor(Date.now() / 1000) + Number(days) * 86400;
      const tx = await contract.createCampaign(title, description, image, goalWei, deadline);
      toast.loading("Mining transaction…", { id: "create" });
      await tx.wait();
      toast.success("Campaign launched 🚀", { id: "create" });
      onOpenChange(false);
      setTitle(""); setDescription(""); setImage(""); setGoal(""); setDays("7");
      onCreated();
    } catch (err: any) {
      toast.error(err?.shortMessage ?? err?.message ?? "Transaction failed", { id: "create" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-brutal-lg max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Launch a campaign</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Deployed to Sepolia. Gas paid with test ETH from MetaMask.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="font-mono text-xs uppercase">Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-none border-2 border-foreground" />
          </div>
          <div>
            <Label htmlFor="desc" className="font-mono text-xs uppercase">Description</Label>
            <Textarea id="desc" required value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-none border-2 border-foreground min-h-24" />
          </div>
          <div>
            <Label htmlFor="img" className="font-mono text-xs uppercase">Image URL (optional)</Label>
            <Input id="img" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="rounded-none border-2 border-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="goal" className="font-mono text-xs uppercase">Goal (ETH)</Label>
              <Input id="goal" required type="number" step="0.0001" min="0.0001" value={goal} onChange={(e) => setGoal(e.target.value)} className="rounded-none border-2 border-foreground" />
            </div>
            <div>
              <Label htmlFor="days" className="font-mono text-xs uppercase">Duration (days)</Label>
              <Input id="days" required type="number" min="1" max="365" value={days} onChange={(e) => setDays(e.target.value)} className="rounded-none border-2 border-foreground" />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none border-2 border-foreground bg-accent text-accent-foreground hover:bg-accent shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] font-bold uppercase tracking-wider"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
            {loading ? "Submitting…" : "Launch Campaign"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
