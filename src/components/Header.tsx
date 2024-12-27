import '../styles/Game.css';

interface Props {
    gamePhases: {[key: number]: string};
    gamePhase: number;
    join: boolean;
    score: number;
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
            {!props.join
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
                    {props.gamePhase === 3 ? <p>{`${props.gamePhases[props.gamePhase]} (Points preneur : ${props.score})`}</p> : <p>{props.gamePhases[props.gamePhase]}</p>}
                </>
            }    
        </>
    );
};
