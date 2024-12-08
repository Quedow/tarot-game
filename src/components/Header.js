import React from 'react';
import '../styles/Game.css';

export default function Header(props) {
    const joinRequest = (e) => {
        if (e.key === 'Enter') {
            props.joinRequest();
        }
    };

    return (
        <>
            {/* <button onClick={ping}>Ping the Server</button> */}
            {!props.join
                ? <>
                    <input
                        className='playerInput'
                        type='text'
                        placeholder='Write your pseudo...'
                        onChange={props.updatePseudo} 
                        onKeyDown={joinRequest}
                    ></input>
                    <button onClick={props.joinRequest}>Join</button>
                </>
                : <>
                    {props.gamePhase === 0 && 
                        <>
                            <button onClick={props.playGame}>Play/Distribute</button>
                            {/* <button onClick={props.joinGame}>Join current game</button> */}
                        </>
                    }
                    {props.gamePhase === 3 ? <p>{`${props.gamePhases[props.gamePhase]} (taker score: ${props.score})`}</p> : <p>{props.gamePhases[props.gamePhase]}</p>}
                </>
            }    
        </>
    );
};
