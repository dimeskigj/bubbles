import { Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { MatchComponent } from './components/match/match.component';

export const routes: Routes = [
  { path: 'match/:id', component: MatchComponent },
  { path: 'lobby', component: LobbyComponent },
  { path: '**', redirectTo: 'lobby' },
];
