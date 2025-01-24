import { Component } from '@angular/core';
import { LobbyService } from '../../services/lobby.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  imports: [],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css',
})
export class LobbyComponent {
  constructor(private lobby: LobbyService, private router: Router) {}

  async onNewMatch(): Promise<void> {
    const match = await this.lobby.createMatch();
    this.router.navigate(['match', match.matchID]);
  }
}
