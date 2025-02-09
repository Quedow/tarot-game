import { Socket } from "socket.io";
import { generatePseudo } from "./src/logic/pseudoGenerator";
import Gameplay from "./src/logic/gameplay";
import { Request, Response } from 'express';
import path, { dirname } from 'path';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import { Bid, Client } from "./src/utils/types";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const MIN_PLAYERS: number = 3;
const MAX_PLAYERS: number = 5;

const clients: Client[] = [];
let isGameStart: boolean = false;
let starter: number = 0;

io.on("connection", (socket: Socket) => {
    if (!isGameStart && clients.length < MAX_PLAYERS) {
        socket.emit("setJoin", true);
        const pseudo = String(socket.handshake.query.pseudo ?? generatePseudo());
        
        clients.push({ id: socket.id, socket: socket, pseudo: pseudo });
        console.log(`New client connected: ${socket.id} (${pseudo})`);
        
        socket.emit("setId", socket.id);
        io.emit("setPlayers", clients.map(client => ({ id: client.id, pseudo: client.pseudo })));
    } else {
        socket.emit("setJoin", false);
    }

    // socket.on("ping", () => console.log(`Ping from ${socket.id}`)); // Dev ping function

    socket.on("playGame", playGame);

    // socket.on("joinGame", () => { joinGame(socket); });

    socket.on("takeOrPass", (bid?: Bid) => { takeGame(socket, validateBid(bid)); });

    socket.on("toChien", (card: number) => { toChien(socket, card); })

    socket.on("playCard", (card: number) => { playCard(socket, card); });

    socket.on("disconnect", () => {
        const index = clients.findIndex(client => client.id === socket.id);
        if (index !== -1) { clients.splice(index, 1); }
        io.emit("setPlayers", clients.map(client => ({ id: client.id, pseudo: client.pseudo })));
        console.log("Client disconnected");
        socket.removeAllListeners();
        if (clients.length === 0) {
            isGameStart = false;
            starter = 0
        }
    });
});

const game = new Gameplay(MIN_PLAYERS);

function playGame() {
    if (clients.length >= MIN_PLAYERS && clients.length <= MAX_PLAYERS) {
        isGameStart = true;
        game.reset(clients.length);
        clients.forEach(client => client.deckIndex = undefined);
        
        game.start(starter); // Shuffle + distribute cards + initiate currentTurn
        emitDecks(); // Send deck to each players
        io.emit("setPhase", 1);
        emitTurn();
    }
}

function emitDecks() {
    const clientsWithoutDeck = clients.filter(client => client.deckIndex === undefined);
    clientsWithoutDeck.forEach(client => {
        emitDeckToClient(client);
    });
}

function emitDeckToClient(client: Client) {
    const decks = game.getDecks();
    const deckIndexesUsed = clients.map(client => client.deckIndex);
    const deckIndexAvailable = decks.findIndex((value: number[], index: number) => !deckIndexesUsed.includes(index));

    client.socket.emit("setDeck", decks[deckIndexAvailable]);
    client.deckIndex = deckIndexAvailable;
    // console.log(`Deck ${deckIndexAvailable} --> ${client.id}`);
}

/* function joinGame(socket) {
    const client = getClientById(socket.id);

    if (client.deckIndex === undefined) {
        emitDeckToClient(client);
    }
    socket.emit("setFold", game.getFold());
    socket.emit("setPhase", 3);
    if (client.deckIndex === game.getTurn()) {
        socket.emit("setTurnId", client.id);
    }
} */

function takeGame(socket: Socket, bid?: Bid) {
    const client = getClientById(socket.id);
    const deckIndex = bid !== undefined && client ? client.deckIndex : undefined;
    const newPhase = game.setTaker(deckIndex, bid);
    
    if (newPhase === -1) {
        starter = (starter + 1) % clients.length;
        playGame();
        return;
    }

    if (newPhase === 2) {
        const takerClient = clients.find(client => client.deckIndex === game.getTaker());
        if (takerClient) {
            io.emit("setFold", game.getChienAsFold());
            takerClient.socket.emit("setChien", game.getDeck(takerClient.deckIndex!));
            io.emit("setTurnId", takerClient.id);
        }
    } else if (newPhase === 3) {
        io.emit("setPhase", 3);
    }
    
    if (bid !== undefined) { io.emit("setTaker", socket.id, bid); }
    if (newPhase !== 2) {
        emitTurn();
    }
}

function toChien(socket: Socket, card: number) {
    // console.log(`Card ${card} --> chien`);
    
    const client = getClientById(socket.id);
    if (!client) { return; }

    const isCompleted = game.toChien(client.deckIndex!, card);
    client.socket.emit("setDeck", game.getDeck(client.deckIndex!));

    if (isCompleted) {
        io.emit("setPhase", 3);
        emitTurn();
    }
}

function playCard(socket: Socket, card: number) {
    // console.log(`Card ${card} --> baize`);
    
    const client = getClientById(socket.id);
    if (client && client.deckIndex === game.getTurn()) {
        const validCard = game.checkPlay({ pseudo: client.pseudo, deckIndex: client.deckIndex }, card);
        if (validCard) {
            socket.emit("setDeck", game.getDeck(client.deckIndex));
            io.emit("setFold", game.getFold());
            emitTurn();

            if (game.isBaizeFull()) {
                io.emit("setScore", game.getScore());

                const isGameOver = game.isGameOver();
                if (isGameOver !== undefined) {
                    io.emit("setGameOver", isGameOver);
                    isGameStart = false;
                    starter = (starter + 1) % clients.length;
                }
            }
        }
    }   
}

function emitTurn() {
    const client = clients.find(client => client.deckIndex === game.getTurn());
    if (client) {
        io.emit("setTurnId", client.id);
    }
}

function getClientById(id: string): Client | undefined {
    return clients.find(client => client.id === id) ?? undefined;
}

function validateBid(bid?: Bid): Bid | undefined {
    return bid && [1, 2, 4, 6].includes(bid.contract) ? bid : undefined;
}


const PORT: number = parseInt(process.env.PORT || "5000", 10);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});