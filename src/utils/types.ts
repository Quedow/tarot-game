import { Socket } from "socket.io";

export const gamePhases: {[key: string]: string} = {
    "-1": 'Attendez le tour des autres joueurs...',
    "1": 'Prendre ou passer ?',
    "2": 'Faites votre chien...',
    "3": 'La partie est en cours !',
    "4": 'Partie terminée !'
};

export const contracts: {[key: number]: string} = {
    1: "Petite",
    2: "Garde",
    4: "Garde sans",
    6: "Garde contre",
};

export interface Client { 
    id?: string;
    socket?: Socket;
    pseudo: string;
    deckIndex?: number;
};

export interface rTaker {
    id: string;
    contract?: number;
    king?: number;
}

export interface rPlayer  {
    id?: string;
    pseudo: string;
}

export interface Player {
    pseudo: string;
    deckIndex: number;
}

export interface Game {
    fold: Play[];
    takers: number[];
    won: number[];
    hasExcuse: boolean;
    score: number;
    giveOrKeepExcuse: 0 | 0.5 | -0.5;
};

export interface Bid {
    contract: number;
    king: number
}

export interface Play {
    player: Player;
    card: number;
}

export interface Fold {
    cards: number[];
    pseudos: string[];
}

export interface GameOver {
    winner: string;
    oudlersNb: number;
    pointsNb: number;
    score: number;
}

export interface rGameState {
    id: string;
    players: rPlayer[];
    phase: number;
    deck: number[];
    turnId: string;
    takerId: string;
    bid: Bid;
    fold: Fold;
    score: number;
}