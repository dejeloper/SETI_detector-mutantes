import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {Buttons} from '@app/components/buttons/buttons';
import {Results, ResultStatus} from '@app/components/results/results';
import {Grid} from '@app/components/grid/grid';
import {DNAService} from '@app/core/services/dna.service';

const DNA_STORAGE_KEY = 'dna-grid';

@Component({
  selector: 'app-board',
  imports: [Buttons, Results, Grid],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board {
  private readonly dnaService = inject(DNAService);

  protected readonly dna = signal<string[]>(this.loadStoredDna() ?? this.dnaService.mutantDNAExample);
  protected readonly resultMessage = signal('');
  protected readonly resultStatus = signal<ResultStatus>('neutral');
  protected readonly isEditing = signal(false);

  constructor() {
    effect(() => {
      sessionStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(this.dna()));
    });

    const onStorageChange = (event: StorageEvent): void => {
      if (event.storageArea === sessionStorage && event.key === DNA_STORAGE_KEY && event.newValue) {
        this.dna.set(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', onStorageChange);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorageChange));
  }

  private loadStoredDna(): string[] | null {
    const stored = sessionStorage.getItem(DNA_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  protected onLoadMutant(): void {
    this.dna.set(this.dnaService.mutantDNAExample);
    this.clearResult();
  }

  protected onLoadHuman(): void {
    this.dna.set(this.dnaService.humanDNAExample);
    this.clearResult();
  }

  protected onRandomize(): void {
    this.dna.set(this.dnaService.generateRandom(this.dna().length));
    this.clearResult();
  }

  protected onValidate(): void {
    const result = this.dnaService.isMutant(this.dna());
    if (result.hasError) {
      this.setResult(result.errorMessage ?? 'Error desconocido', 'error');
      return;
    }
    this.setResult(result.isMutant ? 'ADN mutante' : 'ADN no mutante', result.isMutant ? 'mutant' : 'safe');
  }

  protected onEdit(): void {
    const wasEditing = this.isEditing();
    this.isEditing.set(!wasEditing);

    if (wasEditing) {
      this.onValidate();
    }
  }

  protected onDnaChange(dna: string[]): void {
    this.dna.set(dna);
    this.clearResult();
  }

  protected onGridError(message: string): void {
    this.setResult(message, 'error');
  }

  private setResult(message: string, status: ResultStatus): void {
    this.resultMessage.set(message);
    this.resultStatus.set(status);
  }

  private clearResult(): void {
    this.setResult('', 'neutral');
  }
}
