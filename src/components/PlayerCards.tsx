import user from '../assets/images/user.png'; // <a href="https://www.flaticon.com/fr/icones-gratuites/nom-dutilisateur" title="nom d'utilisateur icônes">Nom d'utilisateur icônes créées par Icon Mela - Flaticon</a>
import React from 'react';
import '../styles/Game.css';

interface Props {
    myId: string;
    players: {id: string, pseudo: string}[];
    turnId: string;
    taker: {id: string, king: number | null };
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
            {props.players.map((player: {id: string, pseudo: string}) => <div key={player.id} className='player'>
                <p>{player.pseudo}</p>
                {player.id === props.taker.id && props.taker.king ? <img alt='profil' src={cardImages[props.taker.king]} /> : <img alt='profil' src={user} />}
                {props.turnId === player.id ? (props.turnId === props.myId ? <p>My turn</p> : <p>Playing...</p>) : <p></p>}
            </div>)}
        </div>
    );
};