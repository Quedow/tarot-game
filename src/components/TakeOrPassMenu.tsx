import { useState } from 'react';
import '../styles/Game.css';
import { rBid } from '../utils/types';
import { contracts } from '../utils/constants';

interface Props {
    isMyTurn: boolean;
    currentContract?: number;
    takeOrPass: (bid?: rBid) => void;
}

export default function TakeOrPassMenu(props: Props) {
    const [contract, setContract] = useState<number | undefined>();

    const cardImages: {[key: number]: string} = {
        114: require('../assets/images/114.png'),
        214: require('../assets/images/214.png'),
        314: require('../assets/images/314.png'),
        414: require('../assets/images/414.png'),
    };

    return (
        <>
            {!contract
                ? <>
                    <button onClick={() => props.takeOrPass()} disabled={!props.isMyTurn}>Passer</button>
                    {Object.entries(contracts)
                        .filter(([contract]) => !props.currentContract || Number(contract) > props.currentContract)
                        .map(([contract, label]) => (
                            <button key={contract} onClick={() => setContract(Number(contract))} disabled={!props.isMyTurn}>
                                {label}
                            </button>
                        ))
                    }
                </>
                : <>
                    <button onClick={() => setContract(undefined)}>Retour</button>
                    {Object.keys(cardImages).map((card) => (
                        <button key={card} onClick={() => props.takeOrPass({contract: contract, king: Number(card)})} disabled={!props.isMyTurn}>
                            Appeler
                            <img alt={String(card)} src={cardImages[Number(card)]} />
                        </button>
                    ))}
                </>
            }
        </>
    );
};