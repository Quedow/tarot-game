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
import { rBid, Client, rGameState } from "./src/utils/types";
import { contracts } from "./src/utils/constants";

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

io.use((socket, next) => {
    const canJoin = !isGameStart && clients.length < MAX_PLAYERS;
    const ip = socket.handshake.address;
  
    const canReJoin = clients.some(client => client.socket.disconnected && client.socket.handshake.address === ip);
  
    if (canJoin || canReJoin) {
        return next();
    }
    return next(new Error("Impossible de rejoindre la partie: partie en cours ou aucune place disponible."));
});  
  

io.on("connection", (socket: Socket) => {
    if (!isGameStart && clients.length < MAX_PLAYERS) {
        const pseudo = String(socket.handshake.query.pseudo ?? generatePseudo());
        
        clients.push({ id: socket.id, socket: socket, pseudo: pseudo });
        console.log(`New client connected: ${socket.id} (${pseudo})`);
        
        socket.emit("setId", socket.id);
        io.emit("setPlayers", getPlayers());
    } else {
        const success = tryRejoin(socket);
        if (!success) {
            socket.disconnect(true);
        }
    }

    // socket.on("ping", () => console.log(`Ping from ${socket.id}`)); // Dev ping function

    socket.on("playGame", playGame);

    socket.on("takeOrPass", (bid?: rBid) => { takeGame(socket, validateBid(bid)); });

    socket.on("toChien", (card: number) => { toChien(socket, card); })

    socket.on("playCard", (card: number) => { playCard(socket, card); });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        const index = clients.findIndex(client => client.id === socket.id);
        if (index !== -1) {
            if (!isGameStart) {
                clients.splice(index, 1);
                io.emit("setPlayers", getPlayers());
            }
        };
        if (!clients.some(client => client.id)) {
            isGameStart = false;
            starter = 0;
            clients.length = 0;
        }
    });

    socket.on("connect_error", (err) => {
        console.error("Connection rejected:", err.message);
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
        io.emit("setPhase", game.getPhase(1));
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

function takeGame(socket: Socket, bid?: rBid) {
    const client = getClientById(socket.id);
    const deckIndex = bid !== undefined && client ? client.deckIndex : undefined;
    const newPhase = game.setTaker(deckIndex, bid);
    
    if (newPhase === -1) {
        starter = (starter + 1) % clients.length;
        playGame();
        return;
    }

    if (newPhase === 2 || newPhase === 3) io.emit("setPhase", game.getPhase(newPhase));

    if (newPhase === 2) {
        const takerClient = getTakerClient();
        if (takerClient) {
            io.emit("setFold", game.getChienAsFold());
            takerClient.socket.emit("setChien", game.getDeck(takerClient.deckIndex!));
            io.emit("setTurnId", takerClient.id);
        }
    }
    
    if (bid !== undefined) { io.emit("setTaker", socket.id, game.getContract()); }
    if (newPhase !== 2) {
        emitTurn();
    }
}

function toChien(socket: Socket, card: number) {
    // console.log(`Card ${card} --> chien`);
    
    const client = getClientById(socket.id);
    if (!client || client.deckIndex !== game.getTurn()) return;

    const isCompleted = game.toChien(client.deckIndex!, card);
    client.socket.emit("setDeck", game.getDeck(client.deckIndex!));

    if (isCompleted) {
        game.setTurn(starter);
        io.emit("setPhase", game.getPhase(3));
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
                    io.emit("setGameOver", isGameOver, game.getPhase(4));
                    isGameStart = false;
                    starter = (starter + 1) % clients.length;
                }
            }
        }
    }   
}

function emitTurn() {
    const clientId = getClientIdTurn();
    if (clientId) {
        io.emit("setTurnId", clientId);
    }
}

function tryRejoin(socket: Socket): boolean {
    const offlineClient = clients.find(client => client.socket.disconnected);
    const ipAddress = socket.handshake.address;
    
    if (!offlineClient || offlineClient.socket.handshake.address !== ipAddress) return false;

    offlineClient.id = socket.id;
    offlineClient.socket = socket;
    const data: rGameState = {
        id: socket.id,
        pseudo: offlineClient.pseudo,
        deck: game.getDeck(offlineClient.deckIndex!),
        fold: game.getPhase() !== 2 ? game.getFold() : game.getChienAsFold(),
        phase: game.getPhase(),
        turnId: getClientIdTurn(),
        score: game.getScore(),
    };
    socket.emit("setRejoin", data);
    io.emit("setPlayers", getPlayers());
    io.emit("setTaker", getTakerClient()?.id, game.getContract());
    emitTurn();
    return true;
}

function getClientById(id: string): Client | undefined {
    return clients.find(client => client.id === id) ?? undefined;
}

function getPlayers() {
    return clients.map(client => ({ id: client.id, pseudo: client.pseudo }));
}

function getClientIdTurn(): string {
    const client = clients.find(client => client.deckIndex === game.getTurn());
    if (!client) throw Error("It is not the turn of any player");
    return client?.id;
}

function getTakerClient(): Client | undefined {
    return clients.find(client => client.deckIndex === game.getTaker());
}

function validateBid(bid?: rBid): rBid | undefined {
    return bid && Object.keys(contracts).map(Number).includes(bid.contract) ? bid : undefined;
}

const PORT: number = parseInt(process.env.PORT || "5000", 10);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});