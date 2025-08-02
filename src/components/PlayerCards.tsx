import userImg from "../assets/images/user.png"; // <a href="https://www.flaticon.com/fr/icones-gratuites/nom-dutilisateur" title="nom d"utilisateur icônes">Nom d"utilisateur icônes créées par Icon Mela - Flaticon</a>
import takerImg from "../assets/images/taker.png";
import "../styles/Game.css";
import { rPlayer, rTaker } from "../utils/types";

interface Props {
    myId: string;
    players: rPlayer[];
    turnId: string;
    taker: rTaker;
    isInGame: boolean;
}

export default function PlayerCards(props: Props) {
    const isMyTurn = props.turnId === props.myId;
    const cardImages: {[key: number]: string}  = {
        114: require("../assets/images/114.png"),
        214: require("../assets/images/214.png"),
        314: require("../assets/images/314.png"),
        414: require("../assets/images/414.png"),
    };
    
    const getColor = (player: rPlayer) => {        
        const isTaker = (player.id === props.taker.id);
        if (!isTaker) return userImg;

        if (props.taker.king) {
            return props.isInGame || props.myId === props.taker.id 
                ? cardImages[props.taker.king] 
                : takerImg;
        }
        return takerImg;
    }

    return (
        <div className="player-container">
          {props.players.map((player: rPlayer, index: number) => {
            const isPlayerTurn = props.turnId === player.id;
    
            return (
                <div key={index} className="player">
                    <p>{player.pseudo}</p>
                    <img
                        alt="avatar"
                        src={getColor(player)}
                    />
                    {isPlayerTurn ? (isMyTurn ? <p>Mon tour</p> : <p>Joue...</p>) : <p></p>}
                </div>
            );
          })}
        </div>
    );
};