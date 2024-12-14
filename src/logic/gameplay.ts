interface Player {
    pseudo: string;
    deckIndex: number;
}

interface Play {
    player: Player;
    card: number;
}

interface Fold {
    cards: number[];
    pseudos: string[];
}

interface GameOver {
    winner: string;
    oudlersNb: number;
    score: number;
}

export default class Gameplay {
    cards: number[];
    chien: number[];
    chienNb: number;
    currentTurn: number;
    decks: number[][];
    game: {
        fold: Play[];
        takers: number[];
        won: number[];
        hasExcuse: boolean;
        score: number;
        giveOrKeepExcuse: 0 | 0.5 | -0.5;
    };
    kingCalled?: number;
    playerNb: number;
    totalTurn: number;
    turnNb: number;

    constructor(clientNb: number) {
        this.cards = Array.from({ length: 22 }, (_, i) => i)
            .concat(Array.from({ length: 14 }, (_, i) => i + 101))
            .concat(Array.from({ length: 14 }, (_, i) => i + 201))
            .concat(Array.from({ length: 14 }, (_, i) => i + 301))
            .concat(Array.from({ length: 14 }, (_, i) => i + 401));

        this.playerNb = clientNb;
        this.chienNb = 78%(3*this.playerNb);
        this.turnNb = (78-this.chienNb)/(3*this.playerNb);

        this.decks = Array.from({ length: this.playerNb }, () => []);
        this.chien = [];
        this.kingCalled = undefined;
        this.game = {
            fold: [],
            takers: [],
            won: [],
            hasExcuse: false,
            score: 0,
            giveOrKeepExcuse: 0,
        };
        
        this.totalTurn = 0
        this.currentTurn = 0;
    }

    start(playerIndex: number) {
        this.shuffleCards();
        this.distributeCards();
        this.setTurn(playerIndex);
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            // Generate a random index
            const j = Math.floor(Math.random() * (i + 1));
    
            // Swap elements at indices i and j
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    distributeCards() {
        while (this.chien.length !== this.chienNb) {
            var index = this.getRandomIndex(this.cards.length-1);
            this.chien.push(this.cards[index]);
            this.cards.removeByIndex(index);
        }
        
        for (let t = 0; t < this.turnNb; t++) {
            for (let p = 0; p < this.playerNb; p++) {
                if (this.cards.length < 3) { break; }
                this.decks[p].push(...this.cards.splice(0, 3));
            }
        }

        this.decks.forEach((deck: number[]) => {
            this.sortDeck(deck);
        });
    }

    setTurn(playerIndex: number){ 
        this.currentTurn = playerIndex;
        this.nextTurn();
    }

    setTaker(deckIndex?: number, king?: number): number {
        if (deckIndex !== undefined && king !== undefined) {
            this.game.takers = [deckIndex];
            this.kingCalled = this.playerNb === 5 ? king : undefined;
        }
    
        if (this.totalTurn === this.playerNb) {
            this.nextTurn();
            if (this.game.takers.length === 0) {
                return -1; // all players passed
            } else {
                const takerDeck = this.decks[this.game.takers[0]];
                takerDeck.push(...this.chien);
                this.sortDeck(takerDeck);
    
                if (this.playerNb === 5 && this.kingCalled !== undefined) {
                    const allyDeck = this.decks.findIndex((deck: number[]) => deck.includes(this.kingCalled!));
                    if (!this.game.takers.includes(allyDeck)) {
                        this.game.takers.push(allyDeck);
                    }
                }
    
                this.game.hasExcuse = this.game.takers.some((taker: number) => this.decks[taker].includes(0));
                return 2; // call phase 2, there is a taker
            }
        }
        this.nextTurn();
        return 1; // still in phase 1, all players didn't took or passed
    }

    toChien(deckIndex: number, card: number): boolean {
        if (![0, 1, 21, 114, 214, 314, 414].includes(card)) {
            this.game.won.push(card);
            this.decks[deckIndex].removeByValue(card);
        }
        return this.game.won.length === this.chienNb;
    }

    checkPlay(player: Player, card: number): boolean {
        if (this.game.fold.length >= this.playerNb) { this.game.fold = []; } // Continue to display the last fold before a new play

        if (!this.isValidCard(player.deckIndex, card)) { return false; }
        
        this.game.fold.push({player: player, card: card}); // Add in baize fold
        this.decks[this.currentTurn].removeByValue(card); // Remove from deck

        if (this.game.fold.length >= this.playerNb) {
            const winner = this.getWinningCard(this.game.fold);
            const { deckIndex } = winner.player;
            const takerWin = this.game.takers.includes(deckIndex);

            const foldCards = this.game.fold.map((play: Play) => play.card);
            const excuseInFold = foldCards.includes(0);
            
            if (excuseInFold) {
                const hasExcuse = this.game.hasExcuse;
                if (takerWin) {
                    if (hasExcuse) {
                        this.game.won.push(...foldCards);
                    } else {
                        this.game.won.push(...foldCards.filter((card: number) => card !== 0));
                        this.game.giveOrKeepExcuse = 0.5;
                    }
                } else if (hasExcuse) {
                    this.game.won.push(0);
                    this.game.giveOrKeepExcuse = -0.5;
                }
            } else if (takerWin) {
                this.game.won.push(...foldCards);
            }

            this.game.score = this.calculateScore(this.game.won);
            // console.log(`Won fold (score: ${this.folds.score}) <--`, winner);

            this.currentTurn = deckIndex;
        } else {
            this.nextTurn();
        }
        return true;
    }

    isValidCard(deckIndex: number, newCard: number): boolean {
        const firstPlay = this.game.fold[0]; // Get the card played by the first player

        if (this.kingCalled && this.totalTurn === this.playerNb + 1 && this.getColor(newCard) === this.getColor(this.kingCalled)) { return false }
    
        if (!firstPlay || firstPlay.card === 0 || newCard === 0) { return true; } // If the new card is the first card being played or card 0, it's always valid
        
        return this.getValidCards(firstPlay, deckIndex).includes(newCard); // Return if the card played is part of all valid cards
    }

    getValidCards(firstPlay: Play, deckIndex: number): number[] {
        const firstColor = this.getColor(firstPlay.card); // Determine the color of the first card
    
        const playerDeck = this.decks[deckIndex]; // Get the player's deck
    
        const bestAtout = Math.max(...this.game.fold.filter((play: Play) => play.card >= 1 && play.card <= 21).map((play: Play) => play.card));
    
        const hasSuperiorAtout = playerDeck.some((card: number) => card >= 1 && card <= 21 && card > bestAtout);
    
        const validCards = playerDeck.filter((card: number) => {
            const sameColor = this.getColor(card) === firstColor; // Check if the card is the same color as the first card
            const isAtout = card >= 1 && card <= 21; // Check if the card is between 1 and 21
            const hasColor = playerDeck.some((card: number) => this.getColor(card) === firstColor); // Check if the player has a card of the first color in their deck
            const hasAtout = playerDeck.some((card: number) => card >= 1 && card <= 21); // Check if the player has a card between 1 and 21 in their deck
    
            if (!sameColor && hasColor) { return false; } // You can't play another color card if you have the color asked
            if (!sameColor && !isAtout && hasAtout) { return false; } // You can't play another color card if you have at least one atout
            if (card < bestAtout && hasSuperiorAtout) { return false; } // You can't play atout < the best atout if you have a better one
    
            return true; // If all conditions are passed, return true
        });
    
        return validCards;
    }

    getWinningCard(baize: Play[]): Play {
        let firstColor = this.getColor(baize.find((play: Play) => play.card != 0)?.card ?? 0);
        let sortedBaize = [...baize].sort((a, b) => b.card - a.card);
    
        // Check for cards between 1 and 21
        let winningPlay = sortedBaize.find(play => play.card >= 1 && play.card <= 21);
    
        // If no cards between 1 and 21, check for cards of the same color as the first card
        if (!winningPlay) {
            winningPlay = sortedBaize.find(play => play.card >= firstColor * 100 && play.card <= (firstColor * 100) + 14);
        }
    
        return winningPlay ? winningPlay : sortedBaize[0];
    }

    calculateScore(wonFolds: number[]): number {
        const points: {[key: number]: number} = {
            0: 4.5, 1: 4.5, 21: 4.5,
            111: 1.5, 211: 1.5, 311: 1.5, 411: 1.5,
            112: 2.5, 212: 2.5, 312: 2.5, 412: 2.5,
            113: 3.5, 213: 3.5, 313: 3.5, 413: 3.5,
            114: 4.5, 214: 4.5, 314: 4.5, 414: 4.5
        };
    
        let score = 0;
        for (let card of wonFolds) {
            if (points.hasOwnProperty(card)) {
                score += points[card];
            } else {
                score += 0.5;
            }
        }
        return score + this.game.giveOrKeepExcuse;
    }

    isGameOver(): GameOver | undefined {
        if (!this.decks.find((deck: number[]) => deck.length !== 0)) {
            const oudlersNb = this.game.won.filter((card: number) => [0, 1, 21].includes(card)).length;
            
            const scoreToWin: {[key: number]: number} = {
                0: 56,
                1: 51,
                2: 41,
                3: 36
            };

            return { 
                winner: this.game.score >= scoreToWin[oudlersNb] ? 'Le preneur' : 'La défense',
                oudlersNb: oudlersNb,
                score: this.game.score
            };
        }
        return;
    }

    nextTurn(): number {
        this.currentTurn = (this.currentTurn + 1) % this.playerNb;
        this.totalTurn++;
        return this.currentTurn;
    }

    sortDeck(deck: number[]): number[] { return deck.sort((a: number, b: number) => a - b); }

    getColor(card: number): number { return Math.floor(card / 100); }
    getRandomIndex(max: number): number { return Math.floor(Math.random() * max); }

    getTurn(): number { return this.currentTurn; }
    getTaker(): number { return this.game.takers[0]; }

    getDeck(playerIndex: number): number[] { return this.decks[playerIndex]; }
    getDecks(): number[][] { return this.decks; }

    getChienNb(): number { return this.chienNb; }
    getChien(): number[] { return this.chien; }
    getFoldWon(): number[] { return this.game.won; }

    getChienAsFold(): Fold { return { cards: this.chien, pseudos: [] }; }
    getFold(): Fold { return { cards: this.game.fold.map((play: Play) => play.card), pseudos: this.game.fold.map((play: Play) => play.player.pseudo) }; }

    isBaizeFull(): boolean { return this.game.fold.length >= this.playerNb; }
    getScore(): number { return this.game.score; }

    reset(clientNb: number) {
        this.cards = Array.from({ length: 22 }, (_, i) => i)
            .concat(Array.from({ length: 14 }, (_, i) => i + 101))
            .concat(Array.from({ length: 14 }, (_, i) => i + 201))
            .concat(Array.from({ length: 14 }, (_, i) => i + 301))
            .concat(Array.from({ length: 14 }, (_, i) => i + 401));

        this.playerNb = clientNb;
        this.chienNb = 78%(3*this.playerNb);
        this.turnNb = (78-this.chienNb)/(3*this.playerNb);

        this.decks = Array.from({ length: this.playerNb }, () => []);
        this.chien = [];
        this.kingCalled = undefined;
        this.game = {
            fold: [],
            takers: [],
            won: [],
            hasExcuse: false,
            score: 0,
            giveOrKeepExcuse: 0,
        };
        
        this.totalTurn = 0
        this.currentTurn = 0;
    }
}

declare global {
    interface Array<T> {
      removeByIndex(index: number): number[];
      removeByValue(value: number) : number[];
    }
  }

Array.prototype.removeByIndex = function(index: number): number[] {
    this.splice(index, 1);
    return this;
}

Array.prototype.removeByValue = function (value: number): number[] {
    let index = this.indexOf(value);
    this.splice(index, 1);
    return this;
}