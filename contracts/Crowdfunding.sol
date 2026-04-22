// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Crowdfunding
 * @notice Minimal trustless crowdfunding. Creators launch campaigns with a
 *         goal (wei) and a deadline. Backers contribute ETH. If the goal is
 *         reached by the deadline, the creator can withdraw. Otherwise,
 *         backers can claim a refund.
 *
 *  Deploy via Remix:
 *   1. Create file Crowdfunding.sol, paste this code.
 *   2. Compile with Solidity 0.8.20+.
 *   3. Deploy on "Injected Provider - MetaMask" connected to Sepolia.
 *   4. Copy the deployed contract address into src/lib/contract.ts
 */
contract Crowdfunding {
    struct Campaign {
        address creator;
        string title;
        string description;
        string image;
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        bool withdrawn;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    event CampaignCreated(uint256 indexed id, address indexed creator, uint256 goal, uint256 deadline);
    event Contributed(uint256 indexed id, address indexed backer, uint256 amount);
    event Withdrawn(uint256 indexed id, uint256 amount);
    event Refunded(uint256 indexed id, address indexed backer, uint256 amount);

    function createCampaign(
        string calldata title,
        string calldata description,
        string calldata image,
        uint256 goal,
        uint256 deadline
    ) external returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(goal > 0, "Goal must be > 0");

        uint256 id = campaignCount++;
        campaigns[id] = Campaign({
            creator: msg.sender,
            title: title,
            description: description,
            image: image,
            goal: goal,
            deadline: deadline,
            raised: 0,
            withdrawn: false
        });

        emit CampaignCreated(id, msg.sender, goal, deadline);
        return id;
    }

    function contribute(uint256 id) external payable {
        Campaign storage c = campaigns[id];
        require(c.creator != address(0), "Unknown campaign");
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "No ETH sent");

        c.raised += msg.value;
        contributions[id][msg.sender] += msg.value;

        emit Contributed(id, msg.sender, msg.value);
    }

    function withdraw(uint256 id) external {
        Campaign storage c = campaigns[id];
        require(msg.sender == c.creator, "Not creator");
        require(block.timestamp >= c.deadline, "Not ended");
        require(c.raised >= c.goal, "Goal not reached");
        require(!c.withdrawn, "Already withdrawn");

        c.withdrawn = true;
        uint256 amount = c.raised;
        (bool ok, ) = payable(c.creator).call{value: amount}("");
        require(ok, "Transfer failed");
        emit Withdrawn(id, amount);
    }

    function refund(uint256 id) external {
        Campaign storage c = campaigns[id];
        require(block.timestamp >= c.deadline, "Not ended");
        require(c.raised < c.goal, "Goal reached");
        uint256 amount = contributions[id][msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[id][msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Refund failed");
        emit Refunded(id, msg.sender, amount);
    }

    function getCampaigns() external view returns (Campaign[] memory list) {
        list = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            list[i] = campaigns[i];
        }
    }
}
