"use client";

import Web3 from "web3";
import Lottery from "./lottery";
import {useEffect, useRef, useState} from "react";

export default function Home() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [address, setAddress] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [nbTickets, setNbTickets] = useState(1);
    let timer;

    /* ---------------------- Variables du contrat ---------------------- */
    const [owner, setOwner] = useState("");
    const [ticketPrice, setTicketPrice] = useState(0);
    const [nbMaxTickets, setNbMaxTickets] = useState(0);
    const [expiration, setExpiration] = useState(0);
    const [winnings, setWinnings] = useState(0);
    const [nbRemainingTickets, setNbRemainingTickets] = useState(0);
    const [nbTotalTickets, setNbTotalTickets] = useState(0);

    useEffect(() => {
        timer = setInterval(() => {
            updateTimer(expiration);
        }, 1000);

        return async () => {
            clearInterval(timer);
        };
    }, [expiration]);

    useEffect(() => {
        initializeData();

        /* --------------------------- Événements --------------------------- */
        Lottery.events.LotteryStarted({
            fromBlock: "latest"
        })
            .on("data", function(event) {
                const exp = event.returnValues.expiration;

                updateTimer(Number(exp));
                setSuccess("La loterie a été démarrée.");
                setError("");
            });

        Lottery.events.LotteryStopped({
            fromBlock: "latest"
        })
            .on("data", function(event) {
                updateTimer(0);
                setError("La loterie a été arrêtée.");
            });

        Lottery.events.TicketsPurchased({
            fromBlock: "latest"
        })
            .on("data", async function (event) {
                if (event.returnValues.participant === address) {
                    setSuccess("Votre achat a bien été réalisé.");
                    setError("");
                }
                await fetchNbTotalTickets();
                await fetchNbRemainingTickets();
            });

        Lottery.events.WinnerSelected({
            fromBlock: "latest"
        })
            .on("data", async function (event) {
                if (event.returnValues.winner === address) {
                    await fetchWinnings();
                    setSuccess("Félicitations ! Vous remportez les gains.");
                    setError("");
                }
                setNbTotalTickets(0);
                setNbRemainingTickets(nbMaxTickets);
            });

        Lottery.events.LotteryCancelled({
            fromBlock: "latest"
        })
            .on("data", function(event) {
                updateTimer(0);
                setNbTotalTickets(0);
                setNbRemainingTickets(nbMaxTickets);
                setError("La loterie a été annulée et remboursée.");
            });

        return async () => {
            await Lottery.events.LotteryStarted().unsubscribe();
            await Lottery.events.LotteryStopped().unsubscribe();
            await Lottery.events.TicketsPurchased().unsubscribe();
            await Lottery.events.WinnerSelected().unsubscribe();
            await Lottery.events.LotteryCancelled().unsubscribe();
        };
    }, []);

    const fetchTicketPrice = async () => {
        const tp = await Lottery.methods.ticketPrice().call();

        setTicketPrice(Number(Web3.utils.fromWei(tp, "ether")));
    };

    const fetchNbMaxTickets = async () => {
        const nb = await Lottery.methods.nbMaxTickets().call();

        setNbMaxTickets(Number(nb));
    };

    const fetchOwner = async () => {
        const own = await Lottery.methods.owner().call();

        setOwner(own);
    };

    const fetchExpiration = async () => {
        const exp = await Lottery.methods.expiration().call();

        updateTimer(Number(exp));
    };

    const fetchWinnings = async (addr) => {
        const win = await Lottery.methods.getPlayerWinnings(addr).call();

        setWinnings(Number(Web3.utils.fromWei(win, "ether")));
    };

    const fetchNbRemainingTickets = async () => {
        const nb = await Lottery.methods.nbRemainingTickets().call();

        setNbRemainingTickets(Number(nb));
    };

    const fetchNbTotalTickets = async () => {
        const nb = await Lottery.methods.getNbTickets().call();

        setNbTotalTickets(Number(nb));
    };

    const initializeData = async () => {
        await fetchTicketPrice();
        await fetchNbMaxTickets();
        await fetchOwner();
        await fetchExpiration();
        await fetchNbRemainingTickets();
        await fetchNbTotalTickets();
        setIsLoaded(true);
    }

    function updateTimer(exp) {
        const current = Number(Math.floor(Date.now() / 1000));
        const remaining = exp - current;

        setExpiration(exp);
        if (remaining > 0) {
            if (!isActive) {
                setIsActive(true);
            }
            setHours(Math.floor((remaining % (3600 * 24)) / 3600));
            setMinutes(Math.floor((remaining % 3600) / 60));
            setSeconds(Math.floor(remaining % 60));
        } else if (isLoaded && isActive) {
            setIsActive(false);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
        }
    }

    const sendTransaction = async ({ data, value = 0 }) => {
        const params = {
            to: Lottery.options.address,
            from: address,
            data: data,
            value: value,
            gasLimit: Web3.utils.toHex(800000)
        };

        return await ethereum.request({ method: 'eth_sendTransaction', params: [params] });
    }

    /* ---------------------------- Handlers ---------------------------- */
    const walletHandler = async () => {
        if (address) {
            setAddress("");
        } else if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAddress(Web3.utils.toChecksumAddress(accounts[0]));
                await fetchWinnings(accounts[0]);
                setError("");
            } catch (err) {
                setError("La connexion au portefeuille a échouée.");
            }
        } else {
            setError("Aucun portefeuille détecté.");
        }
    }

    const startHandler = async () => {
        await sendTransaction({ data: Lottery.methods.startLottery().encodeABI() });
    }

    const stopHandler = async () => {
        await sendTransaction({ data: Lottery.methods.stopLottery().encodeABI() });
    }

    const buyTicketsHandler = async () => {
        const total = nbTickets * ticketPrice;
        await sendTransaction({
            data: Lottery.methods.buyTickets(nbTickets).encodeABI(),
            value: "0x" + Number(Web3.utils.toWei(total, "ether")).toString(16),
        });
    }

    const drawWinnerHandler = async () => {
        await sendTransaction({ data: Lottery.methods.drawWinner().encodeABI() });
    }

    const withdrawWinningsHandler = async () => {
        await sendTransaction({ data: Lottery.methods.withdrawWinnings().encodeABI() });
    }

    const cancelHandler = async () => {
        await sendTransaction({ data: Lottery.methods.cancelLottery().encodeABI() });
    }

    const updateNbTickets = async () => {
        const nb = Number(event.target.value);
        if (nb < 1) {
            setNbTickets(1);
        } else if (nb > nbMaxTickets) {
            setNbTickets(nbMaxTickets);
        } else {
            setNbTickets(nb);
        }
    }

    return (
        <body>
        <header className="topbar">
            <div className="left">
                <img className="logo" src="./assets/images/logo.svg" alt="Université Laval"/>
                <div className="separator"></div>
                <span className="course">IFT-7100</span>
            </div>
            <div className="right">
                <span>uLottery</span>
                <button onClick={walletHandler}>
                    {address ? "Déconnexion" : "Connexion"}
                </button>
            </div>
        </header>
        <main className="container">
            <div className="app">
                {isLoaded ?
                    <>
                        {address ? <div className="alert alert-info">Connecté sur le portefeuille {address}</div> : ""}
                        {error ? <div className="alert alert-danger">{error}</div> : ""}
                        {!error && success ? <div className="alert alert-success">{success}</div> : ""}
                        {owner === address ? <div className="owner">
                            <h2>Gestion de la loterie</h2>
                            <ul className="buttons">
                                <li>
                                    <button onClick={startHandler} disabled={isActive || nbTotalTickets > 0}>
                                        Démarrer
                                    </button>
                                </li>
                                <li>
                                    <button onClick={stopHandler} disabled={!isActive}>
                                        Arrêter
                                    </button>
                                </li>
                                <li>
                                    <button onClick={drawWinnerHandler} disabled={isActive || nbTotalTickets === 0}>
                                        Tirer un gagnant
                                    </button>
                                </li>
                                <li>
                                    <button onClick={cancelHandler} disabled={nbTotalTickets === 0}>
                                        Annuler
                                    </button>
                                </li>
                            </ul>
                        </div> : ""}
                        <div className="lottery">
                            <div className="left">
                                <section>
                                    <h2>Loterie en cours</h2>
                                    {!isActive ? <div className="alert alert-info">
                                        {nbTotalTickets > 0 ? "En attente de la sélection d'un gagnant pour la loterie " +
                                            "précédente." : "Aucune loterie en cours"}
                                    </div> : ""}
                                    <div className="split">
                                        <div className="details">
                                            <h3>Gains potentiels</h3>
                                            <p>{nbTotalTickets * ticketPrice} ETH</p>
                                        </div>
                                        <div className="details">
                                            <h3>Tickets restants</h3>
                                            <p>{nbRemainingTickets}</p>
                                        </div>
                                    </div>
                                    <div className="details">
                                        <h3>Temps restant</h3>
                                        <ul className="expiration">
                                            <li>{hours} H</li>
                                            <li>{minutes} M</li>
                                            <li>{seconds} S</li>
                                        </ul>
                                    </div>
                                </section>
                            </div>
                            <div className="right">
                                <section>
                                    <h2>Achat de tickets</h2>
                                    <div>
                                        <span>Prix par ticket</span>
                                        <span>{ticketPrice} ETH</span>
                                    </div>
                                    <div className="nbTicket">
                                        <label htmlFor="nbTicket">Nombre de tickets</label>
                                        <input id="nbTicket" name="nbTicket" type="number" min="1"
                                               max={nbRemainingTickets} value={nbTickets}
                                               onChange={updateNbTickets} />
                                    </div>
                                    <div>
                                        <span>Coût des tickets</span>
                                        <span>{parseFloat((nbTickets * ticketPrice).toFixed(3))} ETH</span>
                                    </div>
                                    <div>
                                        <p><em>+ Frais de carburant</em></p>
                                    </div>
                                    <button onClick={buyTicketsHandler} disabled={!isActive || !address}>
                                        Acheter {nbTickets} tickets
                                    </button>
                                </section>
                                {address ?
                                    <section>
                                        <h2>Mes gains</h2>
                                        <div>
                                            <span>Solde des gains</span>
                                            <span>{winnings} ETH</span>
                                        </div>
                                        <button onClick={withdrawWinningsHandler} disabled={winnings === 0}>
                                            Retirer les gains
                                        </button>
                                    </section> : ""}
                            </div>
                        </div>
                    </> :
                    <div className="loading">
                        <div className="alert alert-info">Récupération des informations...</div>
                    </div>
                }
            </div>
        </main>
        <footer className="footer">
            <p>IFT-7100 - Projet de session (Équipe 7)</p>
        </footer>
        </body>
    );
}
