import { useCallback, useEffect, useState } from "react";
import { getReadContract } from "@/lib/web3";
import { Campaign, CONTRACT_ADDRESS, RawCampaign } from "@/lib/contract";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (CONTRACT_ADDRESS.startsWith("0x0000")) {
      setError("No contract address configured. Deploy via Remix and paste the address into src/lib/contract.ts");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const contract = await getReadContract();
      const raw: RawCampaign[] = await contract.getCampaigns();
      const list: Campaign[] = raw.map((c, i) => ({
        id: i,
        creator: c.creator,
        title: c.title,
        description: c.description,
        image: c.image,
        goalWei: c.goal,
        deadline: Number(c.deadline),
        raisedWei: c.raised,
        withdrawn: c.withdrawn,
      }));
      setCampaigns(list.reverse());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { campaigns, loading, error, reload: load };
}
