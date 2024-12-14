import '../styles/Game.css';

interface Props {
  gameResult: {winner: string, score: number, oudlersNb: number};
  playGame: () => void;
}

export default function Popup(props: Props) {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{props.gameResult.winner} a gagné !</h2>
        <p>Score preneur : <b>{props.gameResult.score}</b></p>
        <p>Nombre d'atouts : <b>{props.gameResult.oudlersNb}</b></p>
      </div>
      <button onClick={props.playGame}>Rejouer</button>
    </div>
  );
};