// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GoldRaccoonVault {
    address public owner;
    address public agent;
    uint256 public maxRiskScore;
    uint256 public maxTradePercent;

    event AgentApproved(address indexed owner, address indexed agent);
    event RulesUpdated(address indexed owner, uint256 maxRiskScore, uint256 maxTradePercent);
    event DecisionLogged(address indexed owner, address indexed agent, string decisionHash, uint256 riskScore);
    event AgentRevoked(address indexed owner, address indexed previousAgent);

    modifier onlyOwner() {
        require(msg.sender == owner, "GoldRaccoon: not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "GoldRaccoon: not agent");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAgent(address newAgent) external onlyOwner {
        require(newAgent != address(0), "GoldRaccoon: zero agent");
        agent = newAgent;
        emit AgentApproved(msg.sender, newAgent);
    }

    function setRules(uint256 newMaxRiskScore, uint256 newMaxTradePercent) external onlyOwner {
        require(newMaxRiskScore <= 100, "GoldRaccoon: invalid risk");
        require(newMaxTradePercent <= 100, "GoldRaccoon: invalid trade percent");
        maxRiskScore = newMaxRiskScore;
        maxTradePercent = newMaxTradePercent;
        emit RulesUpdated(msg.sender, newMaxRiskScore, newMaxTradePercent);
    }

    function logDecision(string calldata decisionHash, uint256 riskScore) external onlyAgent {
        require(bytes(decisionHash).length > 0, "GoldRaccoon: empty decision");
        require(riskScore <= 100, "GoldRaccoon: invalid risk");
        emit DecisionLogged(owner, msg.sender, decisionHash, riskScore);
    }

    function revokeAgent() external onlyOwner {
        address previousAgent = agent;
        agent = address(0);
        emit AgentRevoked(msg.sender, previousAgent);
    }
}
