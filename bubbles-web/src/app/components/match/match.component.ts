import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { GameService } from '../../services/game.service';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { ClientState } from 'boardgame.io/dist/types/src/client/client';
import { AsyncPipe } from '@angular/common';
import {
  Bubble,
  BubblesState,
  BubbleType,
  PlayerScore,
} from '../../../games/models/bubble';
import { Router } from '@angular/router';
import { Flip } from 'gsap/Flip';
import { gsap } from 'gsap';
@Component({
  selector: 'app-match',
  imports: [AsyncPipe],
  templateUrl: './match.component.html',
  styleUrl: './match.component.css',
})
export class MatchComponent implements OnInit, OnDestroy {
  readonly id = input<string>();
  readonly playerId = signal<string>('');
  state$: Subject<ClientState<BubblesState>>;
  state?: ClientState<BubblesState>;
  playerScore$: Subject<PlayerScore> = new Subject();
  opponentScore$: Subject<PlayerScore> = new Subject();
  destroy$: Subject<void> = new Subject();
  bubbleTypes = BubbleType;

  constructor(
    private lobby: LobbyService,
    private game: GameService,
    private router: Router,
    private element: ElementRef,
    private changeDetector: ChangeDetectorRef
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

    this.state$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (newState) => this._handleNewState(newState),
    });

    this.state$
      .pipe(
        switchMap((state) =>
          of(state?.G.scores.find((s) => s.playerId === this.playerId())!)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(this.playerScore$);

    this.state$
      .pipe(
        switchMap((state) =>
          of(state?.G.scores.find((s) => s.playerId !== this.playerId())!)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(this.opponentScore$);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPopBubble(row: number, col: number): void {
    this.game.tapBubble(row, col);
  }

  private _handleNewState(newState: ClientState<BubblesState>): void {
    const newStateBubbles = newState?.G.board.flat();

    const addedBubbles = newStateBubbles?.filter(
      (bubble) =>
        bubble && !this.state?.G.board.flat().find((b) => b?.id === bubble.id)
    );

    const movedBubbles = newStateBubbles?.filter(
      (bubble, index) =>
        bubble &&
        this.state?.G.board.flat().find((b) => b?.id === bubble.id) &&
        bubble.id !== this.state.G.board.flat()[index]?.id
    );

    this.state = newState;

    this.changeDetector.detectChanges();

    this._animateBubbles(addedBubbles, movedBubbles);
  }

  private _animateBubbles(
    addedBubbles: (Bubble | null)[] | undefined,
    movedBubbles: (Bubble | null)[] | undefined
  ) {
    const movedBubblesElements =
      movedBubbles
        ?.map((bubble) => {
          return this.element.nativeElement.querySelector(
            `[data-flip-id="${bubble!.id}"]`
          );
        })
        .filter((b) => b) ?? [];

    const newBubblesElements =
      addedBubbles
        ?.map((bubble) => {
          return this.element.nativeElement.querySelector(
            `[data-flip-id="${bubble!.id}"]`
          );
        })
        .filter((b) => b) ?? [];

    gsap.fromTo(
      movedBubblesElements,
      { y: -50 },
      {
        y: 0,
        duration: 0.4,
        ease: 'bounce.out',
        onStart: () => {
          navigator.vibrate(movedBubblesElements.length * 5);
        },
        onComplete: () => {
          navigator.vibrate(movedBubblesElements.length * 10);
        },
      }
    );

    gsap.fromTo(
      [newBubblesElements],
      { y: -100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'bounce.out',
        onStart: () => {
          navigator.vibrate(newBubblesElements.length * 10);
        },
        onComplete: () => {
          navigator.vibrate(newBubblesElements.length * 20);
        },
      }
    );
  }
}
