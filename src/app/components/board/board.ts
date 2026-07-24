import {Component, signal} from '@angular/core';
import {Buttons} from '../buttons/buttons';
import {Results} from '../results/results';

@Component({
  selector: 'app-board',
  imports: [Buttons, Results],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board {
  protected readonly resultMessage = signal('');

  protected onValidated(message: string): void {
    this.resultMessage.set(message);
  }
}
