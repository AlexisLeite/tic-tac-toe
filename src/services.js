import { EasyEvents, loadTranslates } from "common";
import { UsersService } from "services/usersService";
export * from "services/errorsService";
export * from "services/gameFlowService";
export * from "services/playersService";
export * from "services/serverComunication";
export * from "services/usersService";

export const ServicesLoader = new (function () {
  EasyEvents.call(this);
  this.addEvents(["ready"]);

  this.ready = false;

  this.onRegisterReady((cb) => {
    if (this.ready) cb();
  });

  // Register here the services you want to load on begining
  /* Promise.all([loadTranslates(), UsersService.loadAvatars()]).then(() => {
    this.ready = true;
    this.fireReady();
  }); */
})();
