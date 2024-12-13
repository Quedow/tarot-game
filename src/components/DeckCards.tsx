import '../styles/Game.css';

interface Props {
    deck: number[];
    playCard: (card: number) => void;
}

export default function DeckCards(props: Props) {
    const style = {
        maxWidth: `calc(85% / ${props.deck.length})`,
    };

    const cardImages: {[key: number]: string} = props.deck.reduce((images: {[key: number]: string}, card: number) => {
        images[card] = require(`../assets/images/cards/${card}.jpg`);
        return images;
    }, {});

    return (
        <div className="deck-container">
            {props.deck.map((card: number) => <img 
                key={card} 
                alt={String(card)} 
                src={cardImages[card]} 
                onClick={() => props.playCard(card)} 
                style={style}
            />)}
        </div>
    );
};
