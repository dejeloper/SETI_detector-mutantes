import {Component, output} from '@angular/core';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.html',
  styleUrl: './buttons.css'
})
export class Buttons {
  loadMutant = output<void>();
  loadHuman = output<void>();
  validate = output<void>();

  protected onLoadMutant(): void {
    this.loadMutant.emit();
  }

  protected onLoadHuman(): void {
    this.loadHuman.emit();
  }

  protected onValidate(): void {
    this.validate.emit();
  }
}
