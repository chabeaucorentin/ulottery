import Web3 from "web3";

const Provider = new Web3.providers.WebsocketProvider(
    "wss://eth-sepolia.blastapi.io/0fb0776a-d0a7-4257-a0d8-f7927098ab10"
);

const web3 = new Web3(Provider);
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"LotteryCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"expiration","type":"uint256"}],"name":"LotteryStarted","type":"event"},{"anonymous":false,"inputs":[],"name":"LotteryStopped","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"participant","type":"address"},{"indexed":false,"internalType":"uint256","name":"nb","type":"uint256"}],"name":"TicketsPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"winner","type":"address"}],"name":"WinnerSelected","type":"event"},{"inputs":[{"internalType":"uint256","name":"nb","type":"uint256"}],"name":"buyTickets","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"cancelLottery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"drawWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"duration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"expiration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNbTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"getPlayerWinnings","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nbMaxTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nbRemainingTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"startLottery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stopLottery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"ticketPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tickets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"winnings","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawWinnings","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const Lottery = new web3.eth.Contract(abi, "0xb48743c12E64D2E7009147b9268385A1B7974896");

export default Lottery;