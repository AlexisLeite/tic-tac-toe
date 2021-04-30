# Game interfaces and apis

## Game class apis

### Properties

- **handler: (gameHandler)=>{}** When the component has finished its mounting sends a handler through this prop that could be used in order to control the game flow.
- **highlight: [Number]** This array tells the game if you want to inlude the highligted class in any square.
- **onGameEnded: () => {}** The game will notify when a game ended.
- **onGameStarted: () => {}** The game will notify when a game started.
- **onWinner: (winner) => {}** The game will notify when a player wins.
- **playerA: { icon: "X", setHandler: (playerHandler, hash) => {} }** Is the player no 1, it must provide an icon and a setHandler method which will be used to send a handler to the player. This handler must be used in order to be able to control each player's moves. The *hash* sent through this method is very important because it'll be used in each call to the handler as a *password*.
- **playerB: { icon: "O", setHandler: (playerHandler, hash) => {} }** The same as playerA.

#### Game Handler

It's sent through the handler callback to the game's parent and has the following structure:

```code
gameHandler {
  **reset()** this method resets the game to its initial state that is: an empty board and not playing.
  **start(turn)** this method starts a new game with initial turn set to *turn*. If no parameter is provided, it'll set the first turn to player A.
}
```

#### Player handler

```code
playerHandler {
  **getFreeSquares()** returns an array containing the free squares in the board, it can be used to calculate a move or whathever.
  **play(square,hash)** you must pass the hash received through the *setHandler* callback in order to prove the caller method is allowed to move. The square must be a number between 0 and 8, but never a square that is already marked by a player or else the game will ignore the order.
}
```
