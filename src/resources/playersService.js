export class PlayersServiceClass {
  constructor() {
    this.loggedPlayers = [];
  }

  async getAvatarImages() {
    if (!("avatars" in this)) {
      this.avatars = this.loadAvatarImages();
    }
    return await this.avatars;
  }

  async loadAvatarImages() {
    return await (await fetch("http://192.168.1.4/avatars")).json();
  }

  login(name, password) {
    const users = [
      { name: "Alexis", password: "Alexis", image: "http://192.168.1.4/images/avatar_29.png" },
      { name: "Alito", password: "Alito", image: "http://192.168.1.4/images/avatar_09.png" },
    ];

    for (const credentials of users) {
      if(credentials.name === name && credentials.password === password) {
        const { name, image } = credentials
        return { name, image };
      }
    }

    return false;
  }

  loginGuest(user, avatar) {}
}

const PlayersService = new PlayersServiceClass();

export default PlayersService;
