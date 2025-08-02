import '../styles/Game.css';
import { contracts } from '../utils/constants';
import { gamePhases } from '../utils/types';

interface Props {
    gamePhase: number;
    isMyTurn: boolean;
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

    const phaseLabel = (phase: number, isMyTurn: boolean) => {
        switch (phase) {
            case -1:
                return gamePhases.WAITING;
            case 1:
                return isMyTurn ? gamePhases.TAKE_OR_PASS : gamePhases.WAITING;
            case 2:
                return isMyTurn ? gamePhases.PRE_GAME : gamePhases.WAITING; 
            case 3:
                return gamePhases.IN_GAME;
            case 4:
                return gamePhases.END_GAME;
            default:
                break;
        }
    }

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
                    <p>{phaseLabel(props.gamePhase, props.isMyTurn)}</p>
                    {props.currentContract && <p>(Bataille pour une <b>{contracts[props.currentContract].toLowerCase()}</b>)</p>}
                </>
            }    
        </>
    );
};
