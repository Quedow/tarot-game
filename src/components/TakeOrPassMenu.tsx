import React from 'react';
import '../styles/Game.css';

export default function TakeOrPassMenu(props: any) {
    const cardImages = {
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        114: require(`../assets/images/114.png`),
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        214: require(`../assets/images/214.png`),
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        314: require(`../assets/images/314.png`),
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        414: require(`../assets/images/414.png`),
    };
    
    return (
        <>
            {props.gamePhase === 1 && 
                <>
                    <button onClick={() => props.takeOrPass(false, null)}>Pass</button>
                    {[114, 214, 314, 414].map((card) => (
                        <button key={card} onClick={() => props.takeOrPass(true, card)}>
                            Take
                            // @ts-expect-error TS(2322): Type 'number' is not assignable to type 'string'.
                            <img alt={card} src={cardImages[card]} />
                        </button>
                    ))}
                </>
            }
        </>
    );
};