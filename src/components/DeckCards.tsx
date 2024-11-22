import React from 'react';
import '../styles/Game.css';

export default function DeckCards(props: any) {
    const style = {
        maxWidth: `calc(85% / ${props.deck.length})`,
    };

    const cardImages = props.deck.reduce((images: any, card: any) => {
        images[card] = require(`../assets/images/cards/${card}.jpg`);
        return images;
    }, {});

    return (
        <div className="deck-container">
            {props.deck.map((card: any) => <img 
                key={card} 
                alt={card} 
                src={cardImages[card]} 
                onClick={() => props.playCard(card)} 
                style={style}
            />)}
        </div>
    );
};
