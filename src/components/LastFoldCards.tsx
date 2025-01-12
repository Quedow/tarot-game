import '../styles/Game.css';

interface Props {
    fold: number[];
}

export default function FoldCards(props: Props) {
    const style = {
        maxWidth: `calc(85% / ${props.fold.length})`,
    };

    const cardImages: {[key: number]: string} = props.fold.reduce((images: {[key: number]: string}, card: number) => {
        images[card] = require(`../assets/images/cards/${card}.jpg`);
        return images;
    }, {});

    return (
        <div className="last-fold-container">
            {props.fold.map((card: number) => (
                <div key={card} style={style}>
                    <img alt={String(card)} src={cardImages[card]} />
                </div>
            ))}
        </div>
    );
};
