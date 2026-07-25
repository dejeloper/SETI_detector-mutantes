import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {Buttons} from '@app/components/buttons/buttons';
import {Results} from '@app/components/results/results';
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
    this.resultMessage.set('');
  }

  protected onLoadHuman(): void {
    this.dna.set(this.dnaService.humanDNAExample);
    this.resultMessage.set('');
  }

  protected onValidate(): void {
    const result = this.dnaService.isMutant(this.dna());
    if (result.hasError) {
      this.resultMessage.set(result.errorMessage ?? 'Error desconocido');
      return;
    }
    this.resultMessage.set(result.isMutant ? 'ADN mutante' : 'ADN no mutante');
  }
}
