import { Component, input, OnInit, signal } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { GameService } from '../../services/game.service';
import { of, Subject, switchMap } from 'rxjs';
import { ClientState } from 'boardgame.io/dist/types/src/client/client';
import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  BubblesState,
  BubbleType,
  PlayerScore,
} from '../../../games/models/bubble';
import { Router } from '@angular/router';
@Component({
  selector: 'app-match',
  imports: [AsyncPipe],
  templateUrl: './match.component.html',
  styleUrl: './match.component.css',
})
export class MatchComponent implements OnInit {
  readonly id = input<string>();
  readonly playerId = signal<string>('');
  state$: Subject<ClientState<BubblesState>>;
  playerScore$: Subject<PlayerScore> = new Subject();
  opponentScore$: Subject<PlayerScore> = new Subject();
  bubbleTypes = BubbleType;

  constructor(
    private lobby: LobbyService,
    private game: GameService,
    private router: Router
  ) {
    this.state$ = this.game.gameState$;
  }

  ngOnInit(): void {
    this.lobby
      .joinMatch(this.id()!)
      .then((data) => {
        this.playerId.set(data.playerID);
        this.game.setCredentials(
          this.id()!,
          data.playerID,
          data.playerCredentials
        );
      })
      .catch((_) => {
        this.router.navigate(['lobby']);
      });

    this.state$
      .pipe(
        switchMap((state) =>
          of(state?.G.scores.find((s) => s.playerId === this.playerId())!)
        )
      )
      .subscribe(this.playerScore$);

    this.state$
      .pipe(
        switchMap((state) =>
          of(state?.G.scores.find((s) => s.playerId !== this.playerId())!)
        )
      )
      .subscribe(this.opponentScore$);
  }

  onPopBubble(row: number, col: number): void {
    this.game.tapBubble(row, col);
  }
}
