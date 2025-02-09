import React, { useState } from 'react';
import turnSound from '../assets/sounds/turnSound.mp3';
import uwu from '../assets/sounds/uwu.mp3';
import ohLaVAche from "../assets/sounds/ohLaVache.mp3";

interface Props {
  setSound: (sound: string) => void;
}

const camelCaseToWords = (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase());
};  

export default function SoundSelector(props: Props) {
  const sounds: { [key: string]: string } = {
    turnSound: turnSound,
    uwu: uwu,
    ohLaVAche: ohLaVAche,
  };

  const [sound, setSound] = useState<string>('turnSound');

  const selectSound = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSound = event.target.value;
    setSound(selectedSound);
    props.setSound(sounds[selectedSound]);
  };

  return (
    <select value={sound} onChange={selectSound}>
      {Object.keys(sounds).map((key) => (
        <option key={key} value={key}>
          {camelCaseToWords(key)}
        </option>
      ))}
    </select>
  );
}