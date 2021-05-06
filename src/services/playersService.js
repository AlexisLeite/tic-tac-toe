import HumanProfiler from "components/profilers/humanProfiler";
import { GameFlowService } from "services";
import { EasyEvents, ucFirst } from "common";

class Player {
  hash = "";

  boardClick(square) {}

  constructor(profile) {
    this.___profile = profile;
  }

  get profile() {
    return this.___profile;
  }

  static get profiler() {
    return function () {
      return (
        <>
          <h3 className="warning">This must be probably a mistake.</h3>
          <p>
            A profiler was instantiated but none was declared. This warning belongs to the fallback
            profiler declared on Player class
          </p>
        </>
      );
    };
  }

  getTurn() {
    console.warn(
      "A player has been given the current turn but it has not implemented the getTurn method."
    );
  }

  onLose() {}

  updateHash(hash) {
    this.hash = hash;
  }
}

class HumanPlayer extends Player {
  static publicName = "Human player";
  kind = "Human";

  static get profiler() {
    return HumanProfiler;
  }

  boardClick(square) {
    GameFlowService.move(this.hash, square);
  }

  getTurn() {
    this.hasTurn = true;
  }
}

class ComputerPlayer extends Player {
  static publicName = "Computer player";
  kind = "Computer";
}

class OnlinePlayer extends Player {
  static publicName = "Online player";
  kind = "Online";
}

class PlayerShortcut {
  constructor(data) {
    Object.assign(this, data);
  }

  off(event, id) {
    let eventName = `off${ucFirst(this.slot)}Player${ucFirst(event)}`;
    if (!(eventName in PlayersService))
      throw Error("You are trying to access an non existent method of PlayerClass");
    return PlayersService[eventName](id);
  }
  on(event, callback) {
    let eventName = `on${ucFirst(this.slot)}Player${ucFirst(event)}`;
    if (!(eventName in PlayersService))
      throw Error("You are trying to access an non existent method of PlayerClass");
    return PlayersService[eventName](callback);
  }

  get opponent() {
    let opponentSlot = this.slot === "main" ? "secondary" : "main";
    return PlayersService.player(opponentSlot);
  }

  get possibleClasses() {
    return PlayersService[`${this.slot}PlayerPossibleClasses`];
  }

  get profile() {
    return PlayersService[`${this.slot}Player`].profile;
  }

  get value() {
    return PlayersService[`${this.slot}Player`];
  }

  set value(value) {
    PlayersService[`${this.slot}Player`] = value;
  }
}

class PlayersServiceClass {
  availableSlots = ["main", "secondary"];
  players = [null, null];

  constructor() {
    EasyEvents.call(this);

    this.addEvents([
      "mainPlayerChange",
      "mainPlayerPossibleClassesChange",
      "secondaryPlayerChange",
      "secondaryPlayerPossibleClassesChange",
    ]);

    this.mainPlayerPossibleClasses = [HumanPlayer, ComputerPlayer];
    this.secondaryPlayerPossibleClassesMap = {
      [HumanPlayer.name]: [OnlinePlayer, HumanPlayer, ComputerPlayer],
      [ComputerPlayer.name]: [ComputerPlayer, HumanPlayer],
    };
    this.secondaryPlayerPossibleClasses = [];

    this.onMainPlayerChange((player) => {
      this.secondaryPlayerPossibleClasses = player
        ? this.secondaryPlayerPossibleClassesMap[player.constructor.name]
        : [];

      this.fireSecondaryPlayerPossibleClassesChange(this.secondaryPlayerPossibleClasses);

      if (
        this.secondaryPlayerPossibleClasses.filter(
          (possibleClass) => this.secondaryPlayer instanceof possibleClass
        ).length === 0
      ) {
        this.secondaryPlayer = null;
      }
    });
  }

  player(slot) {
    if (!["main", "secondary"].includes(slot))
      throw Error("You are trying to access an inexistent slot");

    return new PlayerShortcut({ slot });
  }

  // Getters and setters

  get mainPlayer() {
    return this.players[0];
  }

  set mainPlayer(value) {
    if (value !== null) {
      let approved = false;
      for (let possibleClass of this.mainPlayerPossibleClasses)
        if (value instanceof possibleClass) approved = true;

      if (!approved)
        throw Error("You are trying to set a mainPlayer that is not a Player subclass.");
    }

    this.players[0] = value;
    this.fireMainPlayerChange(value);
  }

  get secondaryPlayer() {
    return this.players[1];
  }

  set secondaryPlayer(value) {
    if (value !== null) {
      if (!(this.mainPlayer instanceof Player))
        throw Error("You can't set a secondary player until you have set the main one.");

      let approved = false;
      for (let possibleClass of this.secondaryPlayerPossibleClasses)
        if (value instanceof possibleClass) approved = true;

      if (!approved)
        throw Error("You are trying to set a secondaryPlayer that is not a Player subclass.");
    }

    this.players[1] = value;

    this.fireSecondaryPlayerChange(value);
  }
}

const PlayersService = new PlayersServiceClass();
const PlayersSlots = ["main", "secondary"];

export { PlayersService, PlayersSlots, Player, HumanPlayer, ComputerPlayer, OnlinePlayer };
