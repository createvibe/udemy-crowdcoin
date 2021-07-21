// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

contract CampaignFactory {

    address[] public campaigns;

    function createCampaign(uint minimum) public {
        address contractAddress = address(new Campaign(msg.sender, minimum));
        campaigns.push(contractAddress);
    }

    function getCampaigns() public view returns (address[] memory) {
        return campaigns;
    }
}

contract Campaign {

    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool isComplete;
        mapping(address => bool) approvals;
        uint approvalCount;
    }

    address payable public manager;
    uint public minContribution;
    mapping(address => bool) public approvers;
    uint public numApprovers;
    Request[] public requests;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(address payable creator, uint minimum) public {
        manager = creator;
        minContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minContribution);
        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            numApprovers += 1;
        }
    }

    function createRequest(string memory description, uint value, address payable recipient)
        public restricted
    {
        Request memory req = Request({
            description: description,
            value: value,
            recipient: recipient,
            isComplete: false,
            approvalCount: 0
        });
        requests.push(req);
    }

    function approveRequest(uint requestIdx) public {
        Request storage req = requests[requestIdx];

        require(
            approvers[msg.sender] &&
            !req.approvals[msg.sender] &&
            !req.isComplete
        );

        req.approvals[msg.sender] = true;
        req.approvalCount += 1;
    }

    function hasApprovedRequest(uint requestIdx, address userAccount) public view returns (bool) {
        Request storage req = requests[requestIdx];
        return req.approvals[userAccount];
    }

    function finalizeRequest(uint requestIdx) public restricted {
        Request storage req = requests[requestIdx];

        require(!req.isComplete);
        require(req.approvalCount > (numApprovers / 2));

        req.recipient.transfer(req.value);
        req.isComplete = true;
    }

    function getRequestCount() public view returns (uint) {
        return requests.length;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minContribution,
            address(this).balance,
            requests.length,
            numApprovers,
            manager
        );
    }
}