import {Component, inject, output} from '@angular/core';
import {DNAService} from '../../core/services/dna.service';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.html',
  styleUrl: './buttons.css'
})
export class Buttons {
  private readonly dnaService = inject(DNAService);

  validated = output<string>();

  protected onValidate(): void {
    this.validated.emit(this.dnaService.validate());
  }

  protected onValidateMutant(): void {
    this.emitMutantResult(this.dnaService.mutantDNAExample);
  }

  protected onValidateHuman(): void {
    this.emitMutantResult(this.dnaService.humanDNAExample);
  }

  private emitMutantResult(dna: string[]): void {
    const result = this.dnaService.isMutant(dna);
    if (result.hasError) {
      this.validated.emit(result.errorMessage ?? 'Error desconocido');
      return;
    }
    this.validated.emit(result.isMutant ? 'ADN mutante' : 'ADN no mutante');
  }
}
