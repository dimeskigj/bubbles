import { Injectable } from '@angular/core';
import { LobbyClient } from 'boardgame.io/client';
import { constants } from '../constants';
import { LobbyAPI } from 'boardgame.io';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  lobbyClient = new LobbyClient({ server: environment.serverUrl });

  createMatch(): Promise<LobbyAPI.CreatedMatch> {
    return this.lobbyClient.createMatch(constants.gameName, {
      numPlayers: 2,
    });
  }

  joinMatch(matchId: string): Promise<LobbyAPI.JoinedMatch> {
    const playerName = localStorage.getItem(constants.gameName)!;
    return this.lobbyClient.joinMatch(constants.gameName, matchId, {
      playerName,
    });
  }
}
