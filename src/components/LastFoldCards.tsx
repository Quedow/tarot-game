import React from 'react';
import '../styles/Game.css';

export default function FoldCards(props: any) {
    const style = {
        maxWidth: `calc(85% / ${props.fold.length})`,
    };

    const cardImages = props.fold.reduce((images: any, card: any) => {
        images[card] = require(`../assets/images/cards/${card}.jpg`);
        return images;
    }, {});

    return (
        <div className="last-fold-container">
            {props.fold.map((card: any, index: any) => (
                <div key={card}  style={style}>
                    <img alt={card} src={cardImages[card]} />
                </div>
            ))}
        </div>
    );
};
