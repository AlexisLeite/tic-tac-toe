# PlayersService

The PlayersService is one of the main services of the application and its purpose is to manage the active players during the whole game cycle. It relays on the Player subclasses in order to offer an interface and the correct functionality through the different game stages, such as movement control, online playing, computer moves calculation.

It offers some events and methods to know on every moment who are the active players and to modify them, according to the user wishes. All that is done while applying the defined restrictions such as no OnlinePlayer against OnlinePlayer.

## Setters / Getters

In order to set or get the current players, the service offers two _slots_: the mainPlayer and the secondaryPlayer. To facilitate the usage, those slots can be used like normal properties, or can be setted through direct assignation. It's to say, if you write _PlayersService.mainPlayer = new ComputerPlayer()_ you will set exactly that, and the PlayersService will make the necessary checks and updates, and even will call the corresponding events.

## Events

The service exposes the following events:

```js
// Turns off the event with the provided id, that id is obtained when calling onMainPlayerChange or onSecondaryPlayerChange
offMainPlayerChange(EventId)
offSecondaryPlayerChange(EventId)

// Sets an event handler to every change on the players, this methods return an id which must be passed in order to turn off the events
onMainPlayerChange(callback(player)) : EventId
onSecondaryPlayerChange(callback(player)) : EventId

// Some times, in order to follow the rules of the game, the availability of different kind of Players change for a particular slot, this event will warn you about it.
// An example of this situation is when you set PlayersService.mainPlayer = new ComputerPlayer().
// At this point, the secondaryPlayer must be one of [HumanPlayer, ComputerPlayer]
// This change will be noticed to all suscribers, as well as when the change is made backwards.
onMainPlayerPossibleClassesChange(callback(possibleClasses))
onSecondaryPlayerPossibleClassesChange(callback(possibleClasses))
```
