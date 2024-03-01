const id = "YOUR_CLIENT_ID"
const sec = "YOUR_SECRET_ID"
const params = `?client_id=${id}&client_secret=${sec}`

export interface user {
  followers: number;
}

export interface player {
  score: number;
  profile: user;
}

export interface repos {
  stargazers_count: number;
}

function getErrorMsg (message: string, username: string): string {
  if (message === 'Not Found') {
    return `${username} doesn't exist`
  }

  return message
}

function getProfile (username: string): Promise<user> {
  return fetch(`https://api.github.com/users/${username}${params}`)
    .then((res) => res.json())
    .then((profile) => {
      if (profile.message) {
        throw new Error(getErrorMsg(profile.message, username))
      }

      return profile;
    })
}

function getRepos (username: string): Promise<repos[]> {
  return fetch(`https://api.github.com/users/${username}/repos${params}&per_page=100`)
    .then((res) => res.json())
    .then((repos) => {
      if (repos.message) {
        throw new Error(getErrorMsg(repos.message, username))
      }

      return repos as repos[];
    })
}

function getStarCount (repos: repos[]): number {
  return repos.reduce((count, { stargazers_count }) => count + stargazers_count , 0)
}

function calculateScore (followers: number, repos: repos[]): number {
  return (followers * 3) + getStarCount(repos)
}

function getUserData (player: string): Promise<player> {
  return Promise.all([
    getProfile(player),
    getRepos(player)
  ]).then(([ profile, repos ]) => ({
    profile,
    score: calculateScore(profile.followers, repos)
  }))
}

function sortPlayers (players: player[]): player[] {
  return players.sort((a, b) => b.score - a.score)
}

export function battle (players: string[]): Promise<player[]> {
  return Promise.all([
    getUserData(players[0]),
    getUserData(players[1])
  ]).then((results) => sortPlayers(results))
}

export function fetchPopularRepos (language: string): Promise<repos[]> {
  const endpoint = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`)

  return fetch(endpoint)
    .then((res) => res.json())
    .then((data) => {
      if (!data.items) {
        throw new Error(data.message)
      }

      return data.items as repos[];
    })
}