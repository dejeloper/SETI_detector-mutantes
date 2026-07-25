import {Component, input} from '@angular/core';

@Component({
  selector: 'app-shuffle-icon',
  templateUrl: './shuffle-icon.html'
})
export class ShuffleIcon {
  size = input<string>('48px');
}
