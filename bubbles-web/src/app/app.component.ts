import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { constants } from './constants';
import {
  uniqueNamesGenerator,
  animals,
  colors,
  NumberDictionary,
} from 'unique-names-generator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  version = environment.version;
  playerName = localStorage.getItem(constants.gameName);

  ngOnInit(): void {
    if (!this.playerName) {
      const randomName = uniqueNamesGenerator({
        dictionaries: [
          colors,
          animals,
          NumberDictionary.generate({ min: 100, max: 999 }),
        ],
      });

      localStorage.setItem(constants.gameName, randomName);
      this.playerName = randomName;
    }
  }
}
