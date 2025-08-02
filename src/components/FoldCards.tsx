import "../styles/Game.css";

interface Props {
    fold: number[];
    pseudos: string[];
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
        <div className="game-container">
            {props.fold.map((card: number, index: number) => (
                <div key={card} className="card-container" style={style}>
                    <img 
                        alt={String(card)} 
                        src={cardImages[card]} 
                    />
                    {props.pseudos.length > 0 && <p>{props.pseudos[index]}</p>}
                </div>
            ))}
        </div>
    );
};
