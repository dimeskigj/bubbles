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
import { filter, of, Subject, switchMap, takeUntil } from 'rxjs';
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
import confetti from 'canvas-confetti';
import { DialogRef, DialogService } from '@ngneat/dialog';
import { QrModalComponent } from '../qr-modal/qr-modal.component';
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
  turnsLeft = signal<number>(10);

  constructor(
    private lobby: LobbyService,
    private game: GameService,
    private router: Router,
    private element: ElementRef,
    private changeDetector: ChangeDetectorRef,
    private dialog: DialogService
  ) {
    this.state$ = this.game.gameState$;
  }

  openDialog(): void {
    this.dialog.open(QrModalComponent, {
      data: {
        url: `https://bubbles.dimeski.net/match/${this.id()}`,
      },
    });
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

    const destroyedBubbleElements =
      this.state?.G.board
        .flat()
        .filter(
          (bubble) =>
            bubble && !newStateBubbles?.find((b) => b?.id === bubble.id)
        )
        ?.map((bubble) => {
          return this.element.nativeElement.querySelector(
            `[data-flip-id="${bubble!.id}"]`
          );
        })
        .filter((b) => b) ?? [];

    if (destroyedBubbleElements.length !== this.state?.G.board.flat().length) {
      destroyedBubbleElements.forEach((element: HTMLDivElement) => {
        const rect = element.getBoundingClientRect();
        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        confetti({
          particleCount: 10,
          startVelocity: 10,
          spread: 60,
          colors: ['#F2EFE7', '#9ACBD0', '#48A6A7', '#2973B2'], // Bubble-like transparent colors
          origin: {
            x: position.x / window.innerWidth,
            y: position.y / window.innerHeight,
          },
          shapes: ['circle'], // Circle shape to mimic bubbles
          ticks: 25, // Particles stay longer on the screen
        });
      });
    }

    const turn = newState?.ctx.turn ?? 0;
    const oldTurn = this.turnsLeft();
    this.turnsLeft.set(21 - turn);

    this.state = newState;

    this.changeDetector.detectChanges();

    this._animateBubbles(addedBubbles, movedBubbles);

    if (newState?.ctx.gameover) {
      const winnerText =
        this.element.nativeElement.querySelector('[winner-text]');

      gsap.fromTo(
        winnerText,
        { y: 100, opacity: 0, display: 'block' },
        { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }
      );
    } else if (oldTurn !== this.turnsLeft() && this.turnsLeft() <= 20) {
      const turnCounterElement =
        this.element.nativeElement.querySelector('[turn-counter]');

      gsap
        .fromTo(
          turnCounterElement,
          { y: 100, opacity: 0, display: 'block' },
          { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }
        )
        .then(() => {
          gsap.fromTo(
            turnCounterElement,
            { y: 0, opacity: 1 },
            { y: -100, opacity: 0, duration: 0.4 }
          );
        })
        .then(() => {
          turnCounterElement.display = 'none';
        });
    }
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
          navigator.vibrate(Math.min(300, movedBubblesElements.length * 5));
        },
        onComplete: () => {
          navigator.vibrate(Math.min(300, movedBubblesElements.length * 10));
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
          navigator.vibrate(Math.min(300, newBubblesElements.length * 10));
        },
        onComplete: () => {
          navigator.vibrate(Math.min(300, newBubblesElements.length * 20));
        },
      }
    );
  }
}
