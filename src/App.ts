import Game from './pages/Game';
import './App.css';

function App() {
  return (
    // @ts-expect-error TS(2749): 'Game' refers to a value, but is being used as a t... Remove this comment to see the full error message
    <Game />
  );
}

export default App;
