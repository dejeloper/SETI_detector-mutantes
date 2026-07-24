import {Component, input} from '@angular/core';

@Component({
  selector: 'app-results',
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  message = input<string>('');
}
