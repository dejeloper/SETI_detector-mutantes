import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Board} from './components/board/board';
import {DnaIcon} from './components/icons/dna-icon/dna-icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Board, DnaIcon],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
