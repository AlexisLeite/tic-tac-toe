const usersApi = 'http://localhost';

class UsersServiceClass {
  async fetch(url,method) {
    let res = await fetch(url,{
      method: method,
      accept: 'application/json'
    });

    return await res.json();
  }

  async tryFetch(url,method) {
    return await this.fetch(url,method).catch(e => {
      console.log(e,'Error during fetch on leaderboard -> usersService');
    });
  }

  async leaderboard() {
    this.tryFetch(`${usersApi}/leaderboard`,'GET');
  }

  async login(user, pass) {
  }
}

const UsersService = new UsersServiceClass();

export {UsersService};