// Paste the address you deployed via Remix on Sepolia here:
export const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

export const CROWDFUNDING_ABI = [
  "function campaignCount() view returns (uint256)",
  "function createCampaign(string title, string description, string image, uint256 goal, uint256 deadline) returns (uint256)",
  "function contribute(uint256 id) payable",
  "function withdraw(uint256 id)",
  "function refund(uint256 id)",
  "function contributions(uint256, address) view returns (uint256)",
  "function getCampaigns() view returns (tuple(address creator, string title, string description, string image, uint256 goal, uint256 deadline, uint256 raised, bool withdrawn)[])",
  "event CampaignCreated(uint256 indexed id, address indexed creator, uint256 goal, uint256 deadline)",
  "event Contributed(uint256 indexed id, address indexed backer, uint256 amount)",
  "event Withdrawn(uint256 indexed id, uint256 amount)",
  "event Refunded(uint256 indexed id, address indexed backer, uint256 amount)",
] as const;

export type RawCampaign = {
  creator: string;
  title: string;
  description: string;
  image: string;
  goal: bigint;
  deadline: bigint;
  raised: bigint;
  withdrawn: boolean;
};

export type Campaign = {
  id: number;
  creator: string;
  title: string;
  description: string;
  image: string;
  goalWei: bigint;
  deadline: number; // unix seconds
  raisedWei: bigint;
  withdrawn: boolean;
};
