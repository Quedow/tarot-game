import { useEffect , useState, useCallback } from 'react';
import useSound from 'use-sound';
import Header from '../components/Header';
import TakeOrPassMenu from '../components/TakeOrPassMenu';
import PlayerCard from '../components/PlayerCards';
import DeckCards from '../components/DeckCards';
import FoldCards from '../components/FoldCards';
import LastFoldCards from '../components/LastFoldCards';
import Popup from '../components/Popup';
import { generatePseudo } from '../logic/pseudoGenerator';
import { io, Socket } from "socket.io-client";
import '../styles/Game.css';
import turnSound from '../assets/sounds/turnSound.mp3';
import { Bid, Fold, GameOver, rPlayer, rTaker } from '../utils/types';

const ENDPOINT = process.env.REACT_APP_ENDPOINT ?? "http://localhost:5000";

export default function Game() {
    const gamePhases: {[key: string]: string} = {
        "-1": 'Le joueur fait son chien...',
        "1": 'Prendre ou passer ?',
        "2": 'Faites votre chien...',
        "3": 'La partie est en cours !',
        "4": 'Partie terminée !'
    };

    const [socket, setSocket] = useState<Socket | undefined>();
    const [pseudo, setPseudo] = useState<string>(generatePseudo());
    const [myId, setMyId] = useState<string>('');
    const [players, setPlayers] = useState<rPlayer[]>([]);
    const [gamePhase, setGamePhase] = useState<number>(0);
    const [deck, setDeck] = useState<number[]>([]);
    const [fold, setFold] = useState<Fold>({ cards: [], pseudos: [] });
    const [turnId, setTurnId] = useState<string>('');
    const [lastFold, setLastFold] = useState<number[]>([]);
    const [gameResult, setGameResult] = useState<GameOver>({ winner: '', oudlersNb: 0, pointsNb: 0, score: 0 });
    const [taker, setTaker] = useState<rTaker>({ id: '' });
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
        if (socket) {
            socket.emit("playGame");
        }
    }, [socket]);

    const takeOrPass = useCallback((bid?: Bid) => {
        if (socket && gamePhase === 1 && isMyTurn()) {
            socket.emit("takeOrPass", bid);
            setGamePhase(-1);
        }
    }, [gamePhase, isMyTurn, socket]);

    const playCard = (cardValue: number) => {
        if (socket && gamePhase === 3 && isMyTurn()) {
            socket.emit("playCard", cardValue);
        } else if (socket && gamePhase === 2) {
            socket.emit("toChien", cardValue);
        }
    };

    const joinRequest = () => {
        const newSocket = io(ENDPOINT, { 
            autoConnect: true,
            query: { pseudo: pseudo }
        });
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }
    

    useEffect(() => {
        if (!socket) return;
        socket.on("setJoin", (join: boolean) => {
            setJoin(join);
            if (!join) {
                socket.disconnect();
            }
        });
        socket.on("setId", setMyId); // <=> socket.on("getId", (id) => { setId(id); });
        socket.on("setPlayers", setPlayers);
        socket.on("setPhase", (phase: number) => {
            setGamePhase(phase);
            if (phase === 1) {
                setFold({ cards: [], pseudos: [] });
                setLastFold([]);
                setGameResult({ winner: '', oudlersNb: 0, pointsNb: 0, score: 0 });
                setTaker({ id: '' });
            } 
            else if (phase === 3) {
                setFold({ cards: [], pseudos: [] });
            }
        });
        socket.on("setDeck", (deck) => setDeck(deck));
        // socket.on("setTurnId", setTurnId);
        socket.on("setTurnId", (turnId: string) => {
            setTurnId(turnId);
            if (turnId === myId) { playTurnSound(); }
        });
        socket.on("setTaker", (takerId: string, bid: Bid) => {
            setTaker({ id: takerId, ...bid});
        });
        socket.on("setChien", (deck: number[]) => {
            setDeck(deck);
            setGamePhase(2);
        });
        socket.on("setFold", (data: {cards: number[], pseudos: string[]}) => {
            setFold(data);
            if (data.cards.length === players.length) {
                setLastFold(data.cards);
            }
        });
        socket.on("setScore", (score: number) => updateState(setGameResult, { score: score }));
        socket.on("setGameOver", (data: GameOver) => {
            setGameResult(data);
            setGamePhase(4);
        });
        return () => {
            socket.off("setId");
            socket.off("setPlayers");
            socket.off("setPhase");
            socket.off("setDeck");
            socket.off("setTurnId");
            socket.off("setTaker");
            socket.off("setChien");
            socket.off("setFold");
            socket.off("setScore");
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
                    joinRequest={joinRequest}
                    playGame={playGame}
                    // joinGame={joinGame}
                />
                {gamePhase === 1 && <TakeOrPassMenu isMyTurn={turnId === myId} takeOrPass={takeOrPass} currentContract={taker.contract} />}
                <LastFoldCards fold={lastFold} /> 
            </div>
            <PlayerCard myId={myId} players={players} turnId={turnId} taker={taker} />
            <FoldCards fold={fold.cards} pseudos={fold.pseudos} />            
            <DeckCards deck={deck} playCard={playCard} />
            {gamePhase === 4 && <Popup gameResult={gameResult} contract={taker.contract} playGame={playGame} />}
        </div>
    );
}