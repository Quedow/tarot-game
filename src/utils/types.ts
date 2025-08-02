import { Socket } from "socket.io";

export enum gamePhases {
    WAITING = 'Attendez le tour des autres joueurs...',
    TAKE_OR_PASS = 'Prendre ou passer ?',
    PRE_GAME = 'Faites votre chien...',
    IN_GAME = 'La partie est en cours !',
    END_GAME = 'Partie terminée !'
}

// Client side

export interface rGameState {
    id: string;
    pseudo: string;
    deck: number[];
    fold: Fold;
    phase: number;
    turnId: string;
    score: number;
}

export interface rPlayer  {
    id: string;
    pseudo: string;
}

export interface rTaker {
    id: string;
    contract?: number;
    king?: number;
}

export interface rBid {
    contract: number;
    king: number
}

// Server side

export interface Client { 
    id: string;
    socket: Socket;
    pseudo: string;
    deckIndex?: number;
};

export interface Player {
    pseudo: string;
    deckIndex: number;
}

export interface Game {
    phase: number;
    fold: Play[];
    takers: number[];
    won: number[];
    hasExcuse: boolean;
    score: number;
    giveOrKeepExcuse: 0 | 0.5 | -0.5;
};

export interface Contract {
    type?: number;
    king?: number
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