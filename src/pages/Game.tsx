import { useEffect , useState, useCallback } from 'react';
import useSound from 'use-sound';
import Header from '../components/Header';
import TakeOrPassMenu from '../components/TakeOrPassMenu';
import PlayerCard from '../components/PlayerCards';
import DeckCards from '../components/DeckCards';
import FoldCards from '../components/FoldCards';
import LastFoldCards from '../components/LastFoldCards';
import SoundSelector from "../components/SoundSelector";
import Popup from '../components/Popup';
import { generatePseudo } from '../logic/pseudoGenerator';
import { io, Socket } from "socket.io-client";
import '../styles/Game.css';
import defaultSound from '../assets/sounds/turnSound.mp3';
import { rBid, Fold, GameOver, rGameState, rPlayer, rTaker } from '../utils/types';

const ENDPOINT = process.env.REACT_APP_ENDPOINT ?? "http://localhost:5000";

export default function Game() {
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

    const [sound, setSound] = useState<string>(defaultSound);
    const [playTurnSound] = useSound(sound);

    const updatePseudo = (e: any) => {    
        if (e.target.value.length <= 8) {
            setPseudo(e.target.value);
        }
    };

    const updateState = useCallback((stateFunction: any, updates: any) => {
        stateFunction((prevState: any) => ({
            ...prevState,
            ...updates
        }));
    }, []);

    // const ping = useCallback(() => { socket.emit("ping"); }, [socket]);
    
    const isMyTurn = useCallback(() => { return myId !== '' && turnId === myId; }, [turnId, myId]);
    
    const playGame = useCallback(() => {
        if (socket) {
            socket.emit("playGame");
        }
    }, [socket]);

    const takeOrPass = useCallback((bid?: rBid) => {
        if (socket && gamePhase === 1 && isMyTurn()) {
            socket.emit("takeOrPass", bid);
        }
    }, [gamePhase, isMyTurn, socket]);

    const playCard = (cardValue: number) => {
        if (!isMyTurn()) return;
        if (socket && gamePhase === 3) {
            socket.emit("playCard", cardValue);
        } else if (socket && gamePhase === 2) {
            socket.emit("toChien", cardValue);
        }
    };

    const joinRequest = () => {
        // setPseudo(input);
        const newSocket = io(ENDPOINT, { 
            autoConnect: true,
            query: { pseudo: pseudo }
        });
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }
    

    useEffect(() => {
        if (!socket) return;
        socket.on("setRejoin", (data: rGameState) => {
            setMyId(data.id);
            setPseudo(data.pseudo);
            updateState(setGameResult, { score: data.score });
            setDeck(data.deck);
            setFold(data.fold);
            setTurnId(data.turnId);
            setGamePhase(data.phase);
            setJoin(true);
        });

        socket.on("setId", (id: string) => {
            setMyId(id);
            setJoin(true);
        });
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
        socket.on("setDeck", (deck: number[]) => setDeck(deck));
        socket.on("setTurnId", (turnId: string) => {
            setTurnId(turnId);
            if (turnId === myId) { playTurnSound(); }
        });
        socket.on("setTaker", (takerId: string, bid: rBid) => {
            setTaker({ id: takerId, ...bid});
        });
        socket.on("setChien", (deck: number[]) => {
            setDeck(deck);
        });
        socket.on("setFold", (data: Fold) => {
            setFold(data);
            if (data.cards.length === players.length) {
                setLastFold(data.cards);
            }
        });
        socket.on("setScore", (score: number) => updateState(setGameResult, { score: score }));
        socket.on("setGameOver", (data: GameOver, phase: number) => {
            setGameResult(data);
            setGamePhase(phase);
        });
        socket.on("connect_error", (error: Error) => {
            setJoin(false);
            socket.disconnect();
            alert(error.message);
        });
        return () => {
            socket.off("setRejoin");
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
            socket.off("connect_error");
        };
    }, [socket, myId, updateState, playTurnSound, players.length]);    

    return (
        <div>
            <div className="menu-container">
                <Header 
                    gamePhase={gamePhase}
                    isMyTurn={isMyTurn()}
                    currentContract={taker.contract}
                    joined={join}
                    updatePseudo={updatePseudo}
                    joinRequest={joinRequest}
                    playGame={playGame}
                />
                {gamePhase === 1 && <TakeOrPassMenu isMyTurn={isMyTurn()} takeOrPass={takeOrPass} currentContract={taker.contract} />}
                <LastFoldCards fold={lastFold} />
                <SoundSelector setSound={setSound} />
            </div>
            <PlayerCard myId={myId} players={players} turnId={turnId} taker={taker} isInGame={gamePhase >= 2} />
            <FoldCards fold={fold.cards} pseudos={fold.pseudos} />
            <DeckCards deck={deck} playCard={playCard} />
            {gamePhase === 4 && <Popup gameResult={gameResult} contract={taker.contract} playGame={playGame} />}
        </div>
    );
}