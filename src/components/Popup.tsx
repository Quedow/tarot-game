import "../styles/Game.css";
import { contracts } from "../utils/constants";
import { GameOver } from "../utils/types";

interface Props {
  gameResult: GameOver;
  contract?: number
  playGame: () => void;
}

export default function Popup(props: Props) {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{props.gameResult.winner} a gagné !</h2>
        <p>Nombre de bouts : <b>{props.gameResult.oudlersNb}</b></p>
        <p>Points preneur : <b>{props.gameResult.pointsNb}</b></p>
        <p>Score preneur : <b>{props.gameResult.score}</b> ({props.contract && contracts[props.contract]})</p>
      </div>
      <button onClick={props.playGame}>Rejouer</button>
    </div>
  );
};