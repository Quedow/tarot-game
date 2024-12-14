import '../styles/Game.css';

interface Props {
    gamePhase: number;
    takeOrPass: (card?: number) => void;
}

export default function TakeOrPassMenu(props: Props) {
    const cardImages: {[key: number]: string} = {
        114: require(`../assets/images/114.png`),
        214: require(`../assets/images/214.png`),
        314: require(`../assets/images/314.png`),
        414: require(`../assets/images/414.png`),
    };
    
    return (
        <>
            {props.gamePhase === 1 && 
                <>
                    <button onClick={() => props.takeOrPass()}>Passer</button>
                    {[114, 214, 314, 414].map((card) => (
                        <button key={card} onClick={() => props.takeOrPass(card)}>
                            Prendre
                            <img alt={String(card)} src={cardImages[card]} />
                        </button>
                    ))}
                </>
            }
        </>
    );
};