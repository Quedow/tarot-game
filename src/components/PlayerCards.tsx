import user from '../assets/images/user.png'; // <a href="https://www.flaticon.com/fr/icones-gratuites/nom-dutilisateur" title="nom d'utilisateur icônes">Nom d'utilisateur icônes créées par Icon Mela - Flaticon</a>
import '../styles/Game.css';
import { rPlayer, rTaker } from '../utils/types';

interface Props {
    myId: string;
    players: rPlayer[];
    turnId: string;
    taker: rTaker;
    isInGame: boolean;
}

export default function PlayerCards(props: Props) {
    const cardImages: {[key: number]: string}  = {
        114: require(`../assets/images/114.png`),
        214: require(`../assets/images/214.png`),
        314: require(`../assets/images/314.png`),
        414: require(`../assets/images/414.png`),
    };

    return (
        <div className="player-container">
          {props.players.map((player: rPlayer) => {
            const isTaker = (player.id === props.taker.id);
            const showColor = (props.isInGame || props.myId === props.taker.id) && isTaker && props.taker.king !== undefined;
            const isPlayerTurn = props.turnId === player.id;
    
            return (
                <div key={player.id} className="player">
                    <p>{player.pseudo}</p>
                    <img
                        alt="profil"
                        src={showColor ? cardImages[props.taker.king!] : user}
                    />
                    {isPlayerTurn ? (props.turnId === props.myId ? <p>Mon tour</p> : <p>Joue...</p>) : <p></p>}
                </div>
            );
          })}
        </div>
    );
};