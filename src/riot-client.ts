import { getPath } from 'windows-shortcuts-ps';
import path from 'path';
import fs from 'fs';
import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { tryX } from './util';


export type LolEndOfGameChampionMasteryUpdate = {
  bonusPointsGained?: number;
  championId?: number;
  gameId?: number;
  grade?: string;
  hasLeveledUp?: boolean;
  id?: string;
  level?: number;
  playerId?: number;
  pointsBeforeGame?: number;
  pointsGained?: number;
  pointsGainedIndividualContribution?: number;
  pointsSinceLastLevelBeforeGame?: number;
  pointsUntilNextLevelAfterGame?: number;
  pointsUntilNextLevelBeforeGame?: number;
  score?: number;
};

export type LolSummonerSummoner = {
  accountId?: number;
  displayName?: string;
  internalName?: string;
  nameChangeFlag?: boolean;
  percentCompleteForNextLevel?: number;
  profileIconId?: number;
  puuid?: string;
  summonerId?: number;
  summonerLevel?: number;
  unnamed?: boolean;
  xpSinceLastLevel?: number;
  xpUntilNextLevel?: number;
};

export default class RiotClient {
  client: AxiosInstance | undefined;

  lockfilePath: string | undefined;

  port: string | undefined;

  async getEOGChampionMasteryUpdates(): Promise<
    LolEndOfGameChampionMasteryUpdate | undefined
  > {
    const response = await tryX(
      this.client!.get<LolEndOfGameChampionMasteryUpdate>(
        "/lol-end-of-game/v1/champion-mastery-updates"
      )
    );
    return response?.data;
  }

  async getCurrentSummoner(): Promise<LolSummonerSummoner | undefined> {
    const response = await tryX(
      this.client!.get<LolSummonerSummoner>("/lol-summoner/v1/current-summoner")
    );
    return response?.data;
  }

  async isReady() {
    if (this.client) {
      return true;
    }
    this.client = await this.getAxiosClient();
    return !!this.client;
  }

  hasClosedOrChanged() {
    const fileExists = fs.existsSync(this.lockfilePath!);
    if (!fileExists) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [_name, _process, port, _password, _protocol] = fs
      .readFileSync(this.lockfilePath!)
      .toString()
      .split(":");
    return this.port !== port;
  }

  async getAxiosClient(): Promise<AxiosInstance | undefined> {
    const riotPath = await getPath(
      "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Riot Games\\League of Legends.lnk"
    );
    const parsedPath = path.parse(riotPath);
    this.lockfilePath = path.join(
      path.dirname(parsedPath.dir),
      "League of Legends",
      "lockfile"
    );
    const lockfileExists = fs.existsSync(this.lockfilePath);
    if (!lockfileExists) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const [_name, _process, port, password, _protocol] = fs
      .readFileSync(this.lockfilePath)
      .toString()
      .split(":");

    this.port = port;
    return axios.create({
      baseURL: `https://127.0.0.1:${port}`,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      auth: {
        username: "riot",
        password,
      },
    });
  }
}
