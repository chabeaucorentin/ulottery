// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ULottery {
    uint public constant duration = 2 hours;
    uint public constant ticketPrice = 0.005 ether;
    uint public constant nbMaxTickets = 200;

    address public owner;
    uint public expiration;
    mapping(address => uint) public winnings;
    address[] public tickets;
    uint public nbRemainingTickets;

    event LotteryStarted(uint expiration);
    event LotteryStopped();
    event TicketsPurchased(address participant, uint nb);
    event WinnerSelected(address winner);
    event LotteryCancelled();

    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut effectuer cette action.");
        _;
    }

    modifier lotteryUnderway() {
        require(block.timestamp < expiration, "La loterie est arretee.");
        _;
    }

    modifier lotteryStopped() {
        require(block.timestamp >= expiration, "La loterie est en cours.");
        _;
    }

    constructor() {
        owner = msg.sender;
        nbRemainingTickets = nbMaxTickets;
    }

    function startLottery() external onlyOwner lotteryStopped {
        require(tickets.length == 0, "Tous les tickets doivent etre reclames.");

        expiration = block.timestamp + duration;
        emit LotteryStarted(expiration);
    }

    function stopLottery() external onlyOwner lotteryUnderway {
        expiration = block.timestamp;
        emit LotteryStopped();
    }

    function buyTickets(uint nb) external payable lotteryUnderway {
        require(msg.value == nb * ticketPrice, "Prix du ticket incorrect.");
        require(nb <= nbRemainingTickets, "Pas assez de tickets disponibles.");

        for (uint i = 0; i < nb; i++) {
            tickets.push(msg.sender);
        }
        nbRemainingTickets -= nb;
        emit TicketsPurchased(msg.sender, nb);
    }

    function drawWinner() external onlyOwner lotteryStopped {
        require(tickets.length > 0, "Aucun ticket actuellement disponible.");

        uint ticket = uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, tickets))) % tickets.length;
        address winner = tickets[ticket];
        uint winnerWinnings = tickets.length * ticketPrice;

        winnings[winner] += winnerWinnings;
        delete tickets;
        nbRemainingTickets = nbMaxTickets;
        emit WinnerSelected(winner);
    }

    function withdrawWinnings() external {
        require(getPlayerWinnings(msg.sender) > 0, "Aucun gain a retirer.");

        address payable winner = payable(msg.sender);
        uint balance = getPlayerWinnings(winner);

        winner.transfer(balance);
        winnings[winner] = 0;
        nbRemainingTickets = nbMaxTickets;
    }

    function cancelLottery() external onlyOwner {
        require(tickets.length > 0, "Aucun ticket actuellement disponible.");

        for (uint ticket = 0; ticket < tickets.length; ticket++) {
            payable(tickets[ticket]).transfer(ticketPrice);
        }
        delete tickets;
        expiration = block.timestamp;
        nbRemainingTickets = nbMaxTickets;
        emit LotteryCancelled();
    }

    function getPlayerWinnings(address player) public view returns (uint) {
        return winnings[player];
    }

    function getNbTickets() external view returns (uint) {
        return tickets.length;
    }
}
