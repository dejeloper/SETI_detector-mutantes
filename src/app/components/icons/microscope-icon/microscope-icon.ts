import {Component, input} from '@angular/core';

@Component({
  selector: 'app-microscope-icon',
  templateUrl: './microscope-icon.html'
})
export class MicroscopeIcon {
  size = input<string>('48px');
}
