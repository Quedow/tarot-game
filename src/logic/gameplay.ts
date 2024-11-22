export class Gameplay {
    cards: any;
    chien: any;
    chienNb: any;
    currentTurn: any;
    decks: any;
    game: any;
    kingCalled: any;
    playerNb: any;
    totalTurn: any;
    turnNb: any;
    constructor(clientNb: any) {
        this.reset(clientNb);
    }

    reset(clientNb: any){
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
        this.kingCalled = null;
        this.game = {
            fold: [],
            takers: [],
            won: [],
            hasExcuse: false,
            score: 0
        };
        
        this.totalTurn = 0
        this.currentTurn = 0;
    }

    start(playerIndex: any) {
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

        this.decks.forEach((deck: any) => {
            this.sortDeck(deck);
        });
    }

    setTurn(playerIndex: any){ 
        this.currentTurn = playerIndex;
        this.nextTurn();
    }

    setTaker(deckIndex: any, king: any) {
        if (deckIndex !== null && king !== null) {
            this.game.takers = [deckIndex];
            this.kingCalled = this.playerNb === 5 ? king : null;
        }
    
        if (this.totalTurn === this.playerNb) {
            this.nextTurn();
            if (this.game.takers.length === 0) {
                return -1; // all players passed
            } else {
                const takerDeck = this.decks[this.game.takers[0]];
                takerDeck.push(...this.chien);
                this.sortDeck(takerDeck);
    
                if (this.playerNb === 5 && this.kingCalled !== null) {
                    const allyDeck = this.decks.findIndex((deck: any) => deck.includes(this.kingCalled));
                    if (!this.game.takers.includes(allyDeck)) {
                        this.game.takers.push(allyDeck);
                    }
                }
    
                this.game.hasExcuse = this.game.takers.some((taker: any) => this.decks[taker].includes(0));
                return 2; // call phase 2, there is a taker
            }
        }
        this.nextTurn();
        return 1; // still in phase 1, all players didn't took or passed
    }

    toChien(deckIndex: any, card: any){
        if (![0, 1, 21, 114, 214, 314, 414].includes(card)) {
            this.game.won.push(card);
            this.decks[deckIndex].removeByValue(card);
        }
        return this.game.won.length === this.chienNb;
    }

    checkPlay(player: any, card: any) {
        if (this.game.fold.length >= this.playerNb) { this.game.fold = []; } // Continue to display the last fold before a new play

        if (!this.isValidCard(player.deckIndex, card)) { return false; }
        
        this.game.fold.push({player: player, card: card}); // Add in baize fold
        this.decks[this.currentTurn].removeByValue(card); // Remove from deck

        if (this.game.fold.length >= this.playerNb) {
            const winner = this.getWinningCard(this.game.fold);
            const { deckIndex } = winner.player;
            const takerWin = this.game.takers.includes(deckIndex);

            const foldCards = this.game.fold.map((play: any) => play.card);
            const excuseInFold = foldCards.includes(0);
            
            if (excuseInFold) {
                const hasExcuse = this.game.hasExcuse;
                if (takerWin) {
                    if (hasExcuse) {
                        this.game.won.push(...foldCards);
                    } else {
                        this.game.won.push(...foldCards.filter((card: any) => card !== 0));
                    }
                } else if (hasExcuse) {
                    this.game.won.push(0);
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

    isValidCard(deckIndex: any, newCard: any) {
        const firstPlay = this.game.fold[0]; // Get the card played by the first player

        if (this.kingCalled && this.totalTurn === this.playerNb + 1 && this.getColor(newCard) === this.getColor(this.kingCalled)) { return false }
    
        if (!firstPlay || firstPlay.card === 0 || newCard === 0) { return true; } // If the new card is the first card being played or card 0, it's always valid
        
        return this.getValidCards(firstPlay, deckIndex).includes(newCard); // Return if the card played is part of all valid cards
    }

    getValidCards(firstPlay: any, deckIndex: any) {
        const firstColor = this.getColor(firstPlay.card); // Determine the color of the first card
    
        const playerDeck = this.decks[deckIndex]; // Get the player's deck
    
        const bestAtout = Math.max(...this.game.fold.filter((play: any) => play.card >= 1 && play.card <= 21).map((play: any) => play.card));
    
        const hasSuperiorAtout = playerDeck.some((card: any) => card >= 1 && card <= 21 && card > bestAtout);
    
        const validCards = playerDeck.filter((card: any) => {
            const sameColor = this.getColor(card) === firstColor; // Check if the card is the same color as the first card
            const isAtout = card >= 1 && card <= 21; // Check if the card is between 1 and 21
            const hasColor = playerDeck.some((card: any) => this.getColor(card) === firstColor); // Check if the player has a card of the first color in their deck
            const hasAtout = playerDeck.some((card: any) => card >= 1 && card <= 21); // Check if the player has a card between 1 and 21 in their deck
    
            if (!sameColor && hasColor) { return false; } // You can't play another color card if you have the color asked
            if (!sameColor && !isAtout && hasAtout) { return false; } // You can't play another color card if you have at least one atout
            if (card < bestAtout && hasSuperiorAtout) { return false; } // You can't play atout < the best atout if you have a better one
    
            return true; // If all conditions are passed, return true
        });
    
        return validCards;
    }

    getWinningCard(baize: any) {
        let firstColor = this.getColor(baize.find((play: any) => play.card != 0).card ?? 0);
        let sortedBaize = [...baize].sort((a, b) => b.card - a.card);
    
        // Check for cards between 1 and 21
        let winningPlay = sortedBaize.find(play => play.card >= 1 && play.card <= 21);
    
        // If no cards between 1 and 21, check for cards of the same color as the first card
        if (!winningPlay) {
            winningPlay = sortedBaize.find(play => play.card >= firstColor * 100 && play.card <= (firstColor * 100) + 14);
        }
    
        return winningPlay ? winningPlay : sortedBaize[0];
    }

    calculateScore(wonFolds: any) {
        const points = {
            0: 4.5, 1: 4.5, 21: 4.5,
            111: 1.5, 211: 1.5, 311: 1.5, 411: 1.5,
            112: 2.5, 212: 2.5, 312: 2.5, 412: 2.5,
            113: 3.5, 213: 3.5, 313: 3.5, 413: 3.5,
            114: 4.5, 214: 4.5, 314: 4.5, 414: 4.5
        };
    
        let score = 0;
        for (let card of wonFolds) {
            if (points.hasOwnProperty(card)) {
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                score += points[card];
            } else {
                score += 0.5;
            }
        }
        return score;
    }

    isGameOver() {
        if (!this.decks.find((deck: any) => deck.length !== 0)) {
            const oudlersNb = this.game.won.filter((card: any) => [0, 1, 21].includes(card)).length;
            
            const scoreToWin = {
                0: 56,
                1: 51,
                2: 41,
                3: 36
            };

            return { 
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                winner: this.game.score >= scoreToWin[oudlersNb] ? "Taker" : "Defender",
                oudlersNb: oudlersNb,
                score: this.game.score
            };
        }
        return null;
    }

    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.playerNb;
        this.totalTurn++;
        return this.currentTurn;
    }

    sortDeck(deck: any) { return deck.sort((a: any, b: any) => a - b); }

    getColor(card: any) { return Math.floor(card / 100); }
    getRandomIndex(max: any) { return Math.floor(Math.random() * max); }

    getTurn() { return this.currentTurn; }
    getTaker(){ return this.game.takers[0]; }

    getDeck(playerIndex: any){ return this.decks[playerIndex]; }
    getDecks(){ return this.decks; }

    getChienNb(){ return this.chienNb; }
    getChien(){ return this.chien; }
    getFoldWon(){ return this.game.won; }

    getChienAsFold(){ return { cards: this.chien, pseudos: [] }; }
    getFold(){ return { cards: this.game.fold.map((play: any) => play.card), pseudos: this.game.fold.map((play: any) => play.player.pseudo) }; }

    isBaizeFull(){ return this.game.fold.length >= this.playerNb; }
    getScore(){ return this.game.score; }
}

// @ts-expect-error TS(2339): Property 'removeByIndex' does not exist on type 'a... Remove this comment to see the full error message
Array.prototype.removeByIndex = function (index: any) {
    this.splice(index, 1);
    return this;
}

// @ts-expect-error TS(2339): Property 'removeByValue' does not exist on type 'a... Remove this comment to see the full error message
Array.prototype.removeByValue = function (value: any) {
    let index = this.indexOf(value);
    this.splice(index, 1);
    return this;
}