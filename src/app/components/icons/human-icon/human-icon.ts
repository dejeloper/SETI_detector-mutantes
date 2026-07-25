import {Component, input} from '@angular/core';

@Component({
  selector: 'app-human-icon',
  templateUrl: './human-icon.html',
})
export class HumanIcon {
  size = input<string>('48px');
}
