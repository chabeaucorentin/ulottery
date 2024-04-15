// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ULottery {
    uint public constant duration = 2 hours;
    uint public constant ticketPrice = 0.005 ether;

    address public owner;
    uint public expiration;
    mapping(address => uint) public winnings;
    address[] public tickets;
    address public lastWinner;
    uint public lastWinnerWinnings;

    event LotteryStarted(uint expiration);
    event LotteryStopped();
    event TicketsPurchased(address participant, uint nb);
    event WinnerSelected(address winner);
    event LotteryCancelled();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action !");
        _;
    }

    modifier lotteryUnderway() {
        require(block.timestamp < expiration, "Lottery has stopped !");
        _;
    }

    modifier lotteryStopped() {
        require(block.timestamp >= expiration, "Lottery is underway !");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startLottery() external onlyOwner lotteryStopped {
        require(tickets.length == 0, "All tickets must be claimed");

        expiration = block.timestamp + duration;
        emit LotteryStarted(expiration);
    }

    function stopLottery() external onlyOwner lotteryUnderway {
        expiration = block.timestamp;
        emit LotteryStopped();
    }

    function buyTickets(uint nb) external payable lotteryUnderway {
        require(msg.value == nb * ticketPrice, "Incorrect ticket price !");

        for (uint i = 0; i < nb; i++) {
            tickets.push(msg.sender);
        }
        emit TicketsPurchased(msg.sender, nb);
    }

    function drawWinner() external onlyOwner lotteryStopped {
        require(tickets.length > 0, "No tickets currently available !");

        uint ticket = uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, tickets))) % tickets.length;
        address winner = tickets[ticket];
        uint winnerWinnings = tickets.length * ticketPrice;

        winnings[winner] += winnerWinnings;
        delete tickets;
        lastWinner = winner;
        lastWinnerWinnings = winnerWinnings;
        emit WinnerSelected(winner);
    }

    function getPlayerWinnings(address player) public view returns (uint) {
        return winnings[player];
    }

    function withdrawWinnings() external {
        require(getPlayerWinnings(msg.sender) > 0, "No winnings to withdraw !");

        address payable winner = payable(msg.sender);
        uint balance = getPlayerWinnings(winner);

        winner.transfer(balance);
        winnings[winner] = 0;
    }

    function cancelLottery() external onlyOwner {
        for (uint ticket = 0; ticket < tickets.length; ticket++) {
            payable(tickets[ticket]).transfer(ticketPrice);
        }
        expiration = block.timestamp;
        emit LotteryCancelled();
    }
}
