import { Component, input, OnInit } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-match',
  imports: [],
  templateUrl: './match.component.html',
  styleUrl: './match.component.css',
})
export class MatchComponent implements OnInit {
  readonly id = input<string>();

  constructor(private lobby: LobbyService) {}

  ngOnInit(): void {
    this.lobby.joinMatch(this.id()!);
  }

  async onPopBubble(): Promise<void> {
    
  }
}
