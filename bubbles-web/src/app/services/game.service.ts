import { Injectable } from '@angular/core';
import { Client } from 'boardgame.io/client';
import { Bubbles } from '../../games/bubbles';
import { SocketIO } from 'boardgame.io/multiplayer';
import { constants } from '../constants';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { ClientState } from 'boardgame.io/dist/types/src/client/client';
import { BubblesState } from '../../games/models/bubble';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  gameState$ = new Subject<ClientState<BubblesState>>();
  gameClient = Client({
    game: Bubbles,
    numPlayers: 2,
    multiplayer: SocketIO({ server: environment.serverUrl }),
    debug: environment.development && false,
  });

  constructor() {
    this.gameClient.start();

    this.gameClient.subscribe((state) => {
      this.gameState$.next(state);
    });
  }

  setCredentials(matchId: string, playerId: string, credentials: string): void {
    this.gameClient.updateMatchID(matchId);
    this.gameClient.updatePlayerID(playerId);
    this.gameClient.updateCredentials(credentials);
  }

  tapBubble(row: number, column: number): void {
    this.gameClient.moves['tapBubble'](row, column);
  }
}
