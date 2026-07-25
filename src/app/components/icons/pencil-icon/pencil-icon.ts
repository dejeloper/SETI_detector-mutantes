import {Component, input} from '@angular/core';

@Component({
  selector: 'app-pencil-icon',
  templateUrl: './pencil-icon.html'
})
export class PencilIcon {
  size = input<string>('48px');
}
