import user from '../assets/images/user.png'; // <a href="https://www.flaticon.com/fr/icones-gratuites/nom-dutilisateur" title="nom d'utilisateur icônes">Nom d'utilisateur icônes créées par Icon Mela - Flaticon</a>
import React from 'react';
import '../styles/Game.css';

export default function PlayerCards(props) {
    const cardImages = {
        114: require(`../assets/images/114.png`),
        214: require(`../assets/images/214.png`),
        314: require(`../assets/images/314.png`),
        414: require(`../assets/images/414.png`),
    };
    
    return (
        <div className="player-container">
            {props.players.map((player) => (
                <div key={player.id} className='player'>
                    <p>{player.pseudo}</p>
                    {player.id === props.taker.id && props.taker.king ? <img alt='profil' src={cardImages[props.taker.king]} /> : <img alt='profil' src={user} />}
                    {props.turnId === player.id && (props.turnId === props.myId ? <p>My turn</p> : <p>Playing...</p>)}
                </div>
            ))}
        </div>
    );
};