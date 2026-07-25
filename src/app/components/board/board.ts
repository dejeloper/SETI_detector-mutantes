import {Component, computed, DestroyRef, effect, inject, signal} from '@angular/core';
import {Buttons} from '@app/components/buttons/buttons';
import {Results, ResultStatus} from '@app/components/results/results';
import {Grid} from '@app/components/grid/grid';
import {DNAService} from '@app/core/services/dna.service';
import {DNAStep, DNAStepCell, DNAStepScanResult} from '@app/core/models/dna-step.model';

const DNA_STORAGE_KEY = 'dna-grid';
const STEP_INTERVAL_MS = 700;

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

  protected readonly isStepMode = signal(false);
  protected readonly isStepPlaying = signal(false);
  private readonly stepResult = signal<DNAStepScanResult | null>(null);
  private readonly stepIndex = signal(-1);
  private readonly validationMatchedCells = signal<DNAStepCell[]>([]);
  private readonly validationIsMutant = signal(false);
  private stepTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly currentStepCells = computed(() => {
    const result = this.stepResult();
    const index = this.stepIndex();
    if (!result || index < 0 || index >= result.steps.length) {
      return [];
    }
    return result.steps[index].cells;
  });

  private readonly matchedCellsSoFar = computed(() => {
    const result = this.stepResult();
    const index = this.stepIndex();
    if (!result) {
      return [];
    }

    const cells: DNAStepCell[] = [];
    for (let i = 0; i <= index && i < result.steps.length; i++) {
      if (result.steps[i].matched) {
        cells.push(...result.steps[i].cells);
      }
    }
    return cells;
  });

  protected readonly isStepFinished = computed(() => {
    const result = this.stepResult();
    return !!result && this.stepIndex() >= result.steps.length - 1;
  });

  protected readonly matchedCells = computed(() =>
    this.isStepMode() ? this.matchedCellsSoFar() : this.validationMatchedCells()
  );

  protected readonly isMutant = computed(() =>
    this.isStepMode() ? (this.stepResult()?.isMutant ?? false) : this.validationIsMutant()
  );

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
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('storage', onStorageChange);
      this.stopStepTimer();
    });
  }

  private loadStoredDna(): string[] | null {
    const stored = sessionStorage.getItem(DNA_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  protected onLoadMutant(): void {
    this.exitStepMode();
    this.dna.set(this.dnaService.mutantDNAExample);
    this.clearResult();
  }

  protected onLoadHuman(): void {
    this.exitStepMode();
    this.dna.set(this.dnaService.humanDNAExample);
    this.clearResult();
  }

  protected onRandomize(): void {
    this.exitStepMode();
    this.dna.set(this.dnaService.generateRandom(this.dna().length));
    this.clearResult();
  }

  protected onValidate(): void {
    const result = this.dnaService.scan(this.dna());
    if (result.hasError) {
      this.setResult(result.errorMessage ?? 'Error desconocido', 'error');
      return;
    }

    this.validationMatchedCells.set(this.extractMatchedCells(result.steps));
    this.validationIsMutant.set(result.isMutant);
    this.setResult(result.isMutant ? 'ADN mutante' : 'ADN no mutante', result.isMutant ? 'mutant' : 'safe');
  }

  protected onEdit(): void {
    this.exitStepMode();
    const wasEditing = this.isEditing();
    this.isEditing.set(!wasEditing);

    if (wasEditing) {
      this.onValidate();
    } else {
      this.clearResult();
    }
  }

  protected onDnaChange(dna: string[]): void {
    this.dna.set(dna);
    this.clearResult();
  }

  protected onGridError(message: string): void {
    this.setResult(message, 'error');
  }

  protected onStepThrough(): void {
    if (this.isStepMode()) {
      this.exitStepMode();
      return;
    }

    const result = this.dnaService.scan(this.dna());
    if (result.hasError) {
      this.setResult(result.errorMessage ?? 'Error desconocido', 'error');
      return;
    }

    this.clearResult();
    this.stepResult.set(result);
    this.stepIndex.set(-1);
    this.isStepMode.set(true);

    if (result.steps.length === 0) {
      this.finishStepMode(result);
      return;
    }

    this.playStepTimer();
  }

  protected onToggleStepPlayback(): void {
    if (this.isStepPlaying()) {
      this.stopStepTimer();
      return;
    }
    this.playStepTimer();
  }

  protected onNextStep(): void {
    if (this.isStepPlaying()) {
      return;
    }
    this.advanceStep();
  }

  private playStepTimer(): void {
    if (this.isStepFinished()) {
      return;
    }

    this.stopStepTimer();
    this.isStepPlaying.set(true);
    this.stepTimer = setInterval(() => this.advanceStep(), STEP_INTERVAL_MS);
  }

  private advanceStep(): void {
    const result = this.stepResult();
    if (!result) {
      return;
    }

    const nextIndex = this.stepIndex() + 1;
    if (nextIndex >= result.steps.length) {
      this.finishStepMode(result);
      return;
    }

    this.stepIndex.set(nextIndex);
    if (nextIndex >= result.steps.length - 1) {
      this.finishStepMode(result);
    }
  }

  private finishStepMode(result: DNAStepScanResult): void {
    this.stopStepTimer();
    this.setResult(result.isMutant ? 'ADN mutante' : 'ADN no mutante', result.isMutant ? 'mutant' : 'safe');
  }

  private stopStepTimer(): void {
    if (this.stepTimer !== null) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.isStepPlaying.set(false);
  }

  private exitStepMode(): void {
    this.stopStepTimer();
    this.isStepMode.set(false);
    this.stepResult.set(null);
    this.stepIndex.set(-1);
  }

  private setResult(message: string, status: ResultStatus): void {
    this.resultMessage.set(message);
    this.resultStatus.set(status);
  }

  private clearResult(): void {
    this.setResult('', 'neutral');
    this.validationMatchedCells.set([]);
    this.validationIsMutant.set(false);
  }

  private extractMatchedCells(steps: DNAStep[]): DNAStepCell[] {
    return steps.filter((step) => step.matched).flatMap((step) => step.cells);
  }
}
