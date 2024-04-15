"use client";

import Web3 from "web3";
import Lottery from "./lottery";
import { useEffect, useState } from "react";

export default function Home() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [web3, setWeb3] = useState(null);
    const [address, setAddress] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [nbTickets, setNbTickets] = useState(1);

    /* ---------------------- Variables du contrat ---------------------- */
    const [ticketPrice, setTicketPrice] = useState(0);
    const [expiration, setExpiration] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [lastWinner, setLastWinner] = useState("");
    const [lastWinnerWinnings, setLastWinnerWinnings] = useState(0);

    useEffect(() => {
        initializeData();

        const timer = setInterval(() => {
            updateTimer();
        }, 1000);

        return () => clearInterval(timer);
    });
    const fetchTicketPrice = async () => {
        const tp = await Lottery.methods.ticketPrice().call();
        setTicketPrice(Number(tp));
    };

    const fetchExpiration = async () => {
        const exp = await Lottery.methods.expiration().call();
        const current = Number(Math.floor(Date.now() / 1000));

        setExpiration(Number(exp));
        updateTimer();
        if (current >= exp) {
            setIsActive(false);
        }
    };

    const fetchTickets = async () => {
        const tic = await Lottery.methods.tickets().call();
        setTickets(tic);
    };

    const fetchLastWinner = async () => {
        const lw = await Lottery.methods.lastWinner().call();
        const lww = await Lottery.methods.lastWinnerWinnings().call();

        setLastWinner(lw);
        setLastWinnerWinnings(lww);
    };

    const initializeData = async () => {
        await fetchTicketPrice();
        await fetchExpiration();
        await fetchLastWinner();
        //await fetchTickets();
        setIsLoaded(true);
    }

    function updateTimer() {
        const current = Number(Math.floor(Date.now() / 1000));
        const remaining = expiration - current;

        if (remaining > 0) {
            setHours(Math.floor((remaining % (3600 * 24)) / 3600));
            setMinutes(Math.floor((remaining % 3600) / 60));
            setSeconds(Math.floor(remaining % 60));
        } else if (isLoaded && isActive) {
            setIsActive(false);
        }
    }

    /* ---------------------------- Handlers ---------------------------- */
    const walletHandler = async () => {
        if (web3) {
            setWeb3(null);
            setAddress("");
        } else if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setWeb3(new Web3(window.ethereum));
                setAddress(accounts[0]);
                setError("");
            } catch (err) {
                setError("La connexion au portefeuille a échouée !");
            }
        } else {
            setError("Aucun portefeuille détecté !");
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
                        {web3 ? "Déconnexion" : "Connexion"}
                    </button>
                </div>
            </header>
            <main className="container">
                <div className="app">
                    {isLoaded ?
                    <>
                        {error ? <div className="alert alert-danger">{error}</div> : ""}
                        {!error && success ? <div className="alert alert-success">{success}</div> : ""}
                        <div className="owner">
                            <h2>Gestion de la loterie</h2>
                            <ul className="buttons">
                                <li>
                                    <button disabled={isActive}>Démarrer</button>
                                </li>
                                <li>
                                    <button disabled={!isActive}>Arrêter</button>
                                </li>
                                <li>
                                    <button disabled={isActive}>Tirer un gagnant</button>
                                </li>
                                <li>
                                    <button disabled={!isActive}>Annuler</button>
                                </li>
                            </ul>
                        </div>
                        <div className="lottery">
                            <section className="left">
                                <h2>Loterie en cours</h2>
                                {!isActive ? <div className="alert alert-info">Aucune loterie en cours.</div> : ""}
                                <div className="split">
                                    <div className="details">
                                        <h3>Gain potentiel</h3>
                                        <p>{tickets.length * ticketPrice} ETH</p>
                                    </div>
                                    <div className="details">
                                        <h3>Tickets en jeu</h3>
                                        <p>{tickets.length}</p>
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
                            <form className="right">
                                <section>
                                    <h2>Achat de tickets</h2>
                                    <div>
                                        <span>Prix par ticket</span>
                                        <span>0.005 ETH</span>
                                    </div>
                                    <div className="nbTicket">
                                        <label htmlFor="nbTicket">Nombre de tickets</label>
                                        <input id="nbTicket" name="nbTicket" type="number" min="1" value={nbTickets}
                                                onChange={event => setNbTickets(Number(event.target.value))} />
                                    </div>
                                    <div>
                                        <span>Coût des tickets</span>
                                        <span>X ETH</span>
                                    </div>
                                    <div>
                                        <span>Frais du réseau</span>
                                        <span>X WEI</span>
                                    </div>
                                    <div className="total">
                                        <span>Total</span>
                                        <span>X ETH</span>
                                    </div>
                                    <button disabled={!isActive}>Acheter X tickets</button>
                                </section>
                            </form>
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
