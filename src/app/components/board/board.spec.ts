import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Board} from '@app/components/board/board';
import {Buttons} from '@app/components/buttons/buttons';
import {Grid} from '@app/components/grid/grid';
import {DNAService} from '@app/core/services/dna.service';

const DNA_STORAGE_KEY = 'dna-grid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BoardInternals = any;

describe('Board', () => {
  let fixture: ComponentFixture<Board>;
  let component: Board;
  let internals: BoardInternals;
  let dnaService: DNAService;

  function getButtons(): Buttons {
    return fixture.debugElement.query(By.directive(Buttons)).componentInstance as Buttons;
  }

  function getGrid(): Grid {
    return fixture.debugElement.query(By.directive(Grid)).componentInstance as Grid;
  }

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({imports: [Board]});
    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;
    internals = component;
    dnaService = TestBed.inject(DNAService);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the mutant DNA example when sessionStorage is empty', () => {
    expect(internals.dna()).toEqual(dnaService.mutantDNAExample);
  });

  it('should load the DNA stored in sessionStorage on creation instead of the mutant example', () => {
    const stored = ['ATGC', 'CGTA', 'GCAT', 'TACG'];
    sessionStorage.setItem(DNA_STORAGE_KEY, JSON.stringify(stored));

    const freshFixture = TestBed.createComponent(Board);

    expect((freshFixture.componentInstance as BoardInternals).dna()).toEqual(stored);
  });

  it('should persist the current dna to sessionStorage', async () => {
    await fixture.whenStable();

    const stored = JSON.parse(sessionStorage.getItem(DNA_STORAGE_KEY) ?? 'null');
    expect(stored).toEqual(dnaService.mutantDNAExample);
  });

  describe('onLoadMutant / onLoadHuman / onRandomize', () => {
    it('should load the mutant example, exit step mode and clear the result', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      getButtons().loadMutant.emit();
      fixture.detectChanges();

      expect(internals.dna()).toEqual(dnaService.mutantDNAExample);
      expect(internals.isStepMode()).toBe(false);
      expect(internals.resultMessage()).toBe('');
    });

    it('should load the human example, exit step mode and clear the result', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      getButtons().loadHuman.emit();
      fixture.detectChanges();

      expect(internals.dna()).toEqual(dnaService.humanDNAExample);
      expect(internals.isStepMode()).toBe(false);
      expect(internals.resultMessage()).toBe('');
    });

    it('should generate a random DNA of the same size, exit step mode and clear the result', () => {
      const originalSize = internals.dna().length;

      getButtons().stepThrough.emit();
      fixture.detectChanges();

      getButtons().randomize.emit();
      fixture.detectChanges();

      expect(internals.dna().length).toBe(originalSize);
      expect(internals.isStepMode()).toBe(false);
      expect(internals.resultMessage()).toBe('');
    });
  });

  describe('onValidate', () => {
    it('should mark the result as mutant and expose the matched cells', () => {
      getButtons().validate.emit();
      fixture.detectChanges();

      expect(internals.resultStatus()).toBe('mutant');
      expect(internals.resultMessage()).toBe('ADN mutante');
      expect(internals.matchedCells().length).toBeGreaterThan(0);
      expect(internals.isMutant()).toBe(true);
    });

    it('should mark the result as safe for a human DNA', () => {
      getGrid().dnaChange.emit(dnaService.humanDNAExample);
      fixture.detectChanges();

      getButtons().validate.emit();
      fixture.detectChanges();

      expect(internals.resultStatus()).toBe('safe');
      expect(internals.resultMessage()).toBe('ADN no mutante');
      expect(internals.isMutant()).toBe(false);
    });

    it('should mark the result as error for an invalid DNA', () => {
      getGrid().dnaChange.emit(['ATGX', 'CAGT', 'TTAT', 'AGAA']);
      fixture.detectChanges();

      getButtons().validate.emit();
      fixture.detectChanges();

      expect(internals.resultStatus()).toBe('error');
      expect(internals.resultMessage()).toBe('El ADN contiene caracteres inválidos.');
    });
  });

  describe('onEdit', () => {
    it('should enter edit mode and clear the result', () => {
      getButtons().validate.emit();
      fixture.detectChanges();

      getButtons().edit.emit();
      fixture.detectChanges();

      expect(internals.isEditing()).toBe(true);
      expect(internals.resultMessage()).toBe('');
    });

    it('should exit edit mode and re-run validation', () => {
      getButtons().edit.emit();
      fixture.detectChanges();

      getButtons().edit.emit();
      fixture.detectChanges();

      expect(internals.isEditing()).toBe(false);
      expect(internals.resultMessage()).toBe('ADN mutante');
    });

    it('should exit step mode when toggled', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      getButtons().edit.emit();
      fixture.detectChanges();

      expect(internals.isStepMode()).toBe(false);
    });
  });

  describe('onDnaChange / onGridError', () => {
    it('should update the dna signal and clear the result', () => {
      getButtons().validate.emit();
      fixture.detectChanges();

      getGrid().dnaChange.emit(dnaService.humanDNAExample);
      fixture.detectChanges();

      expect(internals.dna()).toEqual(dnaService.humanDNAExample);
      expect(internals.resultMessage()).toBe('');
    });

    it('should propagate the grid error as the error state', () => {
      getGrid().cellError.emit('"X" no es una base válida. Solo se permiten A, T, C o G.');
      fixture.detectChanges();

      expect(internals.resultStatus()).toBe('error');
      expect(internals.resultMessage()).toBe('"X" no es una base válida. Solo se permiten A, T, C o G.');
    });
  });

  describe('onStepThrough / step playback', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should be empty before starting', () => {
      expect(internals.currentStepCells()).toEqual([]);
    });

    it('should enter step mode and start playing on the first call', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      expect(internals.isStepMode()).toBe(true);
      expect(internals.isStepPlaying()).toBe(true);
      // el primer paso solo se muestra tras el primer tick del timer, no de inmediato
      expect(internals.currentStepCells()).toEqual([]);

      vi.advanceTimersByTime(700);
      fixture.detectChanges();

      expect(internals.currentStepCells().length).toBe(4);
    });

    it('should exit step mode and stop the timer on the second call', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      getButtons().stepThrough.emit();
      fixture.detectChanges();

      expect(internals.isStepMode()).toBe(false);
      expect(internals.isStepPlaying()).toBe(false);
    });

    it('should not enter step mode and should set the error state for an invalid DNA', () => {
      getGrid().dnaChange.emit(['ATGX', 'CAGT', 'TTAT', 'AGAA']);
      fixture.detectChanges();

      getButtons().stepThrough.emit();
      fixture.detectChanges();

      expect(internals.isStepMode()).toBe(false);
      expect(internals.resultStatus()).toBe('error');
    });

    it('should finish immediately when the DNA is too small to have any possible sequence', () => {
      getGrid().dnaChange.emit(['A']);
      fixture.detectChanges();

      getButtons().stepThrough.emit();
      fixture.detectChanges();

      expect(internals.isStepMode()).toBe(true);
      expect(internals.isStepPlaying()).toBe(false);
      expect(internals.resultMessage()).toBe('ADN no mutante');
    });

    it('should advance through steps automatically and finish on a mutant DNA', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      vi.advanceTimersByTime(700 * 200);
      fixture.detectChanges();

      expect(internals.isStepFinished()).toBe(true);
      expect(internals.isStepPlaying()).toBe(false);
      expect(internals.resultMessage()).toBe('ADN mutante');
    });

    it('should pause and resume playback with onToggleStepPlayback', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      getButtons().togglePlayback.emit();
      fixture.detectChanges();
      expect(internals.isStepPlaying()).toBe(false);

      getButtons().togglePlayback.emit();
      fixture.detectChanges();
      expect(internals.isStepPlaying()).toBe(true);
    });

    it('should advance one step manually with onNextStep while paused', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();
      getButtons().togglePlayback.emit();
      fixture.detectChanges();

      const cellsBefore = internals.currentStepCells();
      getButtons().nextStep.emit();
      fixture.detectChanges();
      const cellsAfter = internals.currentStepCells();

      expect(cellsAfter).not.toEqual(cellsBefore);
    });

    it('should ignore onNextStep while auto-playing', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      const cellsBefore = internals.currentStepCells();
      getButtons().nextStep.emit();
      fixture.detectChanges();
      const cellsAfter = internals.currentStepCells();

      expect(cellsAfter).toEqual(cellsBefore);
    });

    it('should accumulate matched cells in matchedCells while stepping and expose isMutant from the scan result', () => {
      getButtons().stepThrough.emit();
      fixture.detectChanges();

      vi.advanceTimersByTime(700 * 200);
      fixture.detectChanges();

      expect(internals.matchedCells().length).toBeGreaterThan(0);
      expect(internals.isMutant()).toBe(true);
    });
  });

  describe('sessionStorage / storage events', () => {
    it('should update the dna signal when a storage event for dna-grid arrives from another tab', () => {
      const newDna = ['ATGC', 'CGTA', 'GCAT', 'TACG'];
      const event = new StorageEvent('storage', {
        storageArea: sessionStorage,
        key: DNA_STORAGE_KEY,
        newValue: JSON.stringify(newDna)
      });

      window.dispatchEvent(event);
      fixture.detectChanges();

      expect(internals.dna()).toEqual(newDna);
    });

    it('should ignore a storage event with a different key', () => {
      const before = internals.dna();
      const event = new StorageEvent('storage', {
        storageArea: sessionStorage,
        key: 'other-key',
        newValue: JSON.stringify(['ATGC'])
      });

      window.dispatchEvent(event);
      fixture.detectChanges();

      expect(internals.dna()).toEqual(before);
    });

    it('should ignore a storage event from a different storage area', () => {
      const before = internals.dna();
      const event = new StorageEvent('storage', {
        storageArea: localStorage,
        key: DNA_STORAGE_KEY,
        newValue: JSON.stringify(['ATGC'])
      });

      window.dispatchEvent(event);
      fixture.detectChanges();

      expect(internals.dna()).toEqual(before);
    });
  });

  it('should remove the storage listener and clear the step timer on destroy', () => {
    vi.useFakeTimers();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    getButtons().stepThrough.emit();
    fixture.detectChanges();

    fixture.destroy();

    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));

    removeSpy.mockRestore();
    vi.useRealTimers();
  });
});
