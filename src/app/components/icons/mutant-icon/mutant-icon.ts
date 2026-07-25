import {Component, input} from '@angular/core';

@Component({
  selector: 'app-mutant-icon',
  templateUrl: './mutant-icon.html',
})
export class MutantIcon {
  size = input<string>('48px');
}
