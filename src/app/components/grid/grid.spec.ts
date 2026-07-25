import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Grid} from '@app/components/grid/grid';

describe('Grid', () => {
  let fixture: ComponentFixture<Grid>;
  let component: Grid;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [Grid]});
    fixture = TestBed.createComponent(Grid);
    component = fixture.componentInstance;
  });

  function setDna(dna: string[]): void {
    fixture.componentRef.setInput('dna', dna);
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render one read-only cell per character when not editable', () => {
      setDna(['AT', 'CG']);

      const cells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('span.grid-cell');
      expect(cells.length).toBe(4);
      expect(cells[0].textContent?.trim()).toBe('A');
      expect(cells[1].textContent?.trim()).toBe('T');
      expect(cells[2].textContent?.trim()).toBe('C');
      expect(cells[3].textContent?.trim()).toBe('G');
    });

    it('should render an input per cell when editable', () => {
      setDna(['AT', 'CG']);
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input.grid-cell-input');
      expect(inputs.length).toBe(4);
      expect(fixture.nativeElement.querySelectorAll('span.grid-cell').length).toBe(0);
    });

    it('should reflect the dna size through the columns computed via the grid-template-columns style', () => {
      setDna(['ATG', 'CGT', 'GTA']);

      const grid: HTMLElement = fixture.nativeElement.querySelector('.grid');
      expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('should mark a cell as grid-cell-step when it is part of stepCells but not matchedCells', () => {
      setDna(['AT', 'CG']);
      fixture.componentRef.setInput('stepCells', [{row: 0, col: 1}]);
      fixture.detectChanges();

      const cells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('span.grid-cell');
      expect(cells[1].classList.contains('grid-cell-step')).toBe(true);
      expect(cells[0].classList.contains('grid-cell-step')).toBe(false);
      expect(cells[1].classList.contains('grid-cell-matched')).toBe(false);
    });

    it('should mark a cell as grid-cell-matched (and not grid-cell-step) when it is in matchedCells', () => {
      setDna(['AT', 'CG']);
      fixture.componentRef.setInput('stepCells', [{row: 0, col: 1}]);
      fixture.componentRef.setInput('matchedCells', [{row: 0, col: 1}]);
      fixture.detectChanges();

      const cells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('span.grid-cell');
      expect(cells[1].classList.contains('grid-cell-matched')).toBe(true);
      expect(cells[1].classList.contains('grid-cell-step')).toBe(false);
    });

    it('should not render anything when dna is empty', () => {
      setDna([]);

      expect(fixture.nativeElement.querySelector('.grid')).toBeNull();
    });
  });

  describe('onCellInput', () => {
    function getInput(index: number): HTMLInputElement {
      return fixture.nativeElement.querySelectorAll('input.grid-cell-input')[index] as HTMLInputElement;
    }

    beforeEach(() => {
      setDna(['AT', 'CG']);
      fixture.componentRef.setInput('editable', true);
      fixture.detectChanges();
    });

    it('should clear the input and emit cellError when more than 1 character is typed', () => {
      let emittedMessage = '';
      component.cellError.subscribe((message) => (emittedMessage = message));

      const input = getInput(0);
      input.value = 'AT';
      input.dispatchEvent(new Event('input'));

      expect(emittedMessage).toBe('Solo se permite un carácter por celda.');
      expect(input.value).toBe('');
    });

    it('should clear the input and emit cellError for an invalid base', () => {
      let emittedMessage = '';
      component.cellError.subscribe((message) => (emittedMessage = message));

      const input = getInput(0);
      input.value = 'X';
      input.dispatchEvent(new Event('input'));

      expect(emittedMessage).toBe('"X" no es una base válida. Solo se permiten A, T, C o G.');
      expect(input.value).toBe('');
    });

    it('should normalize a lowercase valid base to uppercase and emit dnaChange', () => {
      let emittedDna: string[] = [];
      component.dnaChange.subscribe((dna) => (emittedDna = dna));

      const input = getInput(0);
      input.value = 'g';
      input.dispatchEvent(new Event('input'));

      expect(emittedDna).toEqual(['GT', 'CG']);
    });

    it('should keep the previous character when the cell is cleared', () => {
      let emittedDna: string[] = [];
      component.dnaChange.subscribe((dna) => (emittedDna = dna));

      const input = getInput(0);
      input.value = '';
      input.dispatchEvent(new Event('input'));

      expect(emittedDna).toEqual(['AT', 'CG']);
    });

    it('should not modify rows other than the one being edited', () => {
      let emittedDna: string[] = [];
      component.dnaChange.subscribe((dna) => (emittedDna = dna));

      const secondRowFirstCell = getInput(2); // row 1, col 0
      secondRowFirstCell.value = 'T';
      secondRowFirstCell.dispatchEvent(new Event('input'));

      expect(emittedDna).toEqual(['AT', 'TG']);
    });
  });
});
