import {Component, input} from '@angular/core';

@Component({
  selector: 'app-dna-icon',
  templateUrl: './dna-icon.html',
})
export class DnaIcon {
  size = input<string>('48px');
}
