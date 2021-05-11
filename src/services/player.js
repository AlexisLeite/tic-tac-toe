import { GameFlowService } from "services";

export class Player {
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
    this.player = GameFlowService.getByHash(this.hash);
  }
}
