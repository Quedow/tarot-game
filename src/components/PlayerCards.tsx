// @ts-expect-error TS(2307): Cannot find module '../assets/images/user.png' or ... Remove this comment to see the full error message
import user from '../assets/images/user.png'; // <a href="https://www.flaticon.com/fr/icones-gratuites/nom-dutilisateur" title="nom d'utilisateur icônes">Nom d'utilisateur icônes créées par Icon Mela - Flaticon</a>
import React from 'react';
import '../styles/Game.css';

export default function PlayerCards(props: any) {
    const cardImages = {
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        114: require(`../assets/images/114.png`),
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        214: require(`../assets/images/214.png`),
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        314: require(`../assets/images/314.png`),
        // @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        414: require(`../assets/images/414.png`),
    };
    
    return (
        <div className="player-container">
            {props.players.map((player: any) => <div key={player.id} className='player'>
                <p>{player.pseudo}</p>
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                {player.id === props.taker.id && props.taker.king ? <img alt='profil' src={cardImages[props.taker.king]} /> : <img alt='profil' src={user} />}
                {props.turnId === player.id ? (props.turnId === props.myId ? <p>My turn</p> : <p>Playing...</p>) : <p></p>}
            </div>)}
        </div>
    );
};