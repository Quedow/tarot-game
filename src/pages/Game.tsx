import React, { useEffect , useState, useCallback } from 'react';
import useSound from 'use-sound';
import Header from '../components/Header';
import TakeOrPassMenu from '../components/TakeOrPassMenu';
import PlayerCard from '../components/PlayerCards';
import DeckCards from '../components/DeckCards';
import FoldCards from '../components/FoldCards';
import LastFoldCards from '../components/LastFoldCards';
import Popup from '../components/Popup';
import { generatePseudo } from '../logic/pseudoGenerator';
import io from 'socket.io-client';
import '../styles/Game.css';
// @ts-expect-error TS(2307): Cannot find module '../assets/sounds/turnSound.mp3... Remove this comment to see the full error message
import turnSound from '../assets/sounds/turnSound.mp3';

const ENDPOINT = "https://tarot-game-iy1j.onrender.com";
// const ENDPOINT = "http://localhost:5000";

function Game() {
    const gamePhases = {
        "-1": 'Waiting for the dog...',
        "1": 'Take or pass ?',
        "2": 'Making your dog...',
        "3": 'Game start !',
        "4": 'Game over !'
    };

    const [socket, setSocket] = useState(null);
    const [pseudo, setPseudo] = useState(generatePseudo());
    const [myId, setMyId] = useState('');
    const [players, setPlayers] = useState([]);
    const [gamePhase, setGamePhase] = useState(0);
    const [deck, setDeck] = useState([]);
    const [fold, setFold] = useState({ cards: [], pseudos: [] });
    const [turnId, setTurnId] = useState('');
    const [lastFold, setLastFold] = useState([]);
    const [gameResult, setGameResult] = useState({ winner: '', score: 0, oudlersNb: 0 });
    const [taker, setTaker] = useState({ id: '', king: null });
    const [join, setJoin] = useState(false);

    const [playTurnSound] = useSound(turnSound);

    const updatePseudo = useCallback((e: any) => {    
        if (!join && e.target.value.length <= 8) {
            setPseudo(e.target.value);
        }
    }, [join]);

    const updateState = useCallback((stateFunction: any, updates: any) => {
        stateFunction((prevState: any) => ({
            ...prevState,
            ...updates
        }));
    }, []);

    // const ping = useCallback(() => { socket.emit("ping"); }, [socket]);
    
    const isMyTurn = useCallback(() => { return turnId === myId; }, [turnId, myId]);

    // const joinGame = useCallback(() => { socket.emit("joinGame"); }, [socket]);
    
    const playGame = useCallback(() => { 
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        socket.emit("playGame");
    }, [socket]);

    const takeOrPass = useCallback((isTaken: any, card: any) => {
        if (gamePhase === 1 && isMyTurn()) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            socket.emit("takeOrPass", { isTaken: isTaken, king: card });
            setGamePhase(-1);
        }
    }, [gamePhase, isMyTurn, socket]);

    const playCard = (cardValue: any) => {
        if (gamePhase === 3 && isMyTurn()) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            socket.emit("playCard", cardValue);
        } else if (gamePhase === 2) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            socket.emit("toChien", cardValue);
        }
    };

    const joinRequest = () => {
        const newSocket = io(ENDPOINT, { 
            autoConnect: true,
            query: { pseudo: pseudo }
        });
        // @ts-expect-error TS(2345): Argument of type 'Socket<DefaultEventsMap, Default... Remove this comment to see the full error message
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }
    

    useEffect(() => {
        if (!socket) return;
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setJoin", (join: any) => {
            setJoin(join);
            if (!join) {
                // @ts-expect-error TS(2339): Property 'disconnect' does not exist on type 'neve... Remove this comment to see the full error message
                socket.disconnect();
            }
        });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setId", setMyId); // <=> socket.on("getId", (id) => { setId(id); });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setPlayers", setPlayers);
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setPhase", (phase: any) => {
            setGamePhase(phase);
            if (phase === 1) {
                setFold({ cards: [], pseudos: [] });
                setLastFold([]);
                setGameResult({ winner: '', score: 0, oudlersNb: 0 });
                setTaker({ id: '', king: null });
            }
        });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setDeck", (deck: any) => setDeck(deck));
        // socket.on("setTurnId", setTurnId);
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setTurnId", (turnId: any) => {
            setTurnId(turnId);
            if (turnId === myId) { playTurnSound(); }
        });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setTaker", (takerId: any, kingCalled: any) => {
            setTaker({ id: takerId, king: kingCalled});
        });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setChien", (deck: any) => {
            setDeck(deck);
            setGamePhase(2);
        });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setFold", (data: any) => {
            setFold(data);
            if (data.cards.length === players.length) {
                setLastFold(data.cards);
            }
        });
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setScore", (score: any) => updateState(setGameResult, { score: score }));
        // @ts-expect-error TS(2339): Property 'on' does not exist on type 'never'.
        socket.on("setGameOver", (data: any) => {
            setGameResult(data);
            setGamePhase(4);
        });
        return () => {
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setId");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setPlayers");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setPhase");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setDeck");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setTurnId");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setTaker");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setChien");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setFold");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setScore");
            // @ts-expect-error TS(2339): Property 'off' does not exist on type 'never'.
            socket.off("setGameOver");
        };
    }, [socket, myId, updateState, playTurnSound, players.length]);    

    return (
        <div>
            <div className="menu-container">
                <Header 
                    gamePhases={gamePhases}
                    gamePhase={gamePhase}
                    join={join}
                    score={gameResult.score}
                    updatePseudo={updatePseudo}
                    joinRequest={() => joinRequest()}
                    playGame={playGame}
                    // joinGame={joinGame}
                />
                <TakeOrPassMenu gamePhase={gamePhase} takeOrPass={takeOrPass} />
                <LastFoldCards fold={lastFold} /> 
            </div>
            <PlayerCard myId={myId} players={players} turnId={turnId} taker={taker} />
            <FoldCards fold={fold.cards} pseudos={fold.pseudos} />            
            <DeckCards deck={deck} playCard={playCard} />
            {gamePhase === 4 && <Popup gameResult={gameResult} playGame={playGame} />}
        </div>
    );
}

export default Game;