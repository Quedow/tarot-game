import '../styles/Game.css';
import { contracts } from '../utils/types';

interface Props {
    gamePhase: number;
    phaseLabel: string;
    joined: boolean;
    currentContract?: number;
    joinRequest: () => void;
    updatePseudo: (e: any) => void;
    playGame: () => void;
}

export default function Header(props: Props) {
    const joinRequest = (e: any) => {
        if (e.key === 'Enter') {
            props.joinRequest();
        }
    };

    return (
        <>
            {/* <button onClick={ping}>Ping the Server</button> */}
            {!props.joined
                ? <>
                    <input
                        className='playerInput'
                        type='text'
                        placeholder='Écris ton pseudo...'
                        onChange={props.updatePseudo} 
                        onKeyDown={joinRequest}
                    ></input>
                    <button onClick={props.joinRequest}>Rejoindre</button>
                </>
                : <>
                    {props.gamePhase === 0 && 
                        <>
                            <button onClick={props.playGame}>Jouer/Distribuer</button>
                            {/* <button onClick={props.joinGame}>Join current game</button> */}
                        </>
                    }
                    <p>{props.phaseLabel}</p>
                    {props.gamePhase !== 1 && props.currentContract && <p>(Bataille pour une <b>{contracts[props.currentContract].toLowerCase()}</b>)</p>}
                </>
            }    
        </>
    );
};
