# Tarot Game

> November 2023 to now

## I. Context

An online tarot game to play with friends remotely.

<p align="center">
  <img width="720" alt="Tarot In Game" src="./src/assets/images/tarot_in_game.png">
</p>


## II. Releases

In progress:

To do:
- [ ] Possibility to rejoin game if disconnected
- [ ] Highlight valid cards

- 2501.1.6.0
Updates:
- [X] Choose turn sound
- [X] Cancel contract
- [X] Offset last cards after zooming one
- [X] King called displayed when game start
- [X] Display contract

- 2412.1.5.0
Updates:
- [X] Take small, guard + score system

- 2412.1.4.0
Updates:
- [X] Game translated in french
- [X] Turn of player making the chien marked
- [X] At the end of the chien, fold cleared

- 2412.1.3.1
Fixes:
- [X] Fix excuse calculation in takers score

- 2412.1.3.0
Updates:
- [X] Migration to TypeScript

- 2411.1.2.0
Updates:
- [X] Reset last fold when new game start
- [X] Card figures with letters
- [X] Click ENTER to join the game

- 2410.1.1.1
Fixes:
- [X] Fix excuse consideration in number of oudlers
- [X] Fix auto-size layers
- [X] Fix icon size

- 2410.1.1.0
Updates:
- [X] Show who takes what
- [X] Reduce card sizes
- [X] Show last fold
- [X] Change beginner after each game
- [X] Add nicknames
- [X] 4-player Tarot
- [X] Real-time points
- [X] Faster zoom, smaller size
- [X] Show everyone whose turn it is
- [X] Implement everyone passes
- [X] Close gameover menu
- [X] Know who plays what
- [X] Show who took
- [X] Your turn sound
- [X] Rule can't play at first turn, color taken

- 2410.1.0.1
Fixes:
- [X] Block joiner during a game
- [X] Excuse not counted (for oudlersNb)
- [X] "Play" anti-spam
- [X] Same size cards
- [X] Heart queen bug (best card bug with wrong color)
- [X] Point counter issue
- [X] "Your Turn" issue + Can pass but not your turn
- [X] Restart game issue
- [X] Score issue
- [X] Partner score not take in account
- [X] Excuse issue if fold lose
- [X] Issue if first color is Excuse
- [X] Excuse issue if fold win but winner don't have excuse

## III. Getting Started

In the project directory, you can run:

### `npm start` or `npm run start`

Runs the app in the development mode.\
Open [http://localhost:5001](http://localhost:5001) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `tsx ./server.js`

Runs the server.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.