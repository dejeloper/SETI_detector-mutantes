import {Component, computed, input, output} from '@angular/core';

const VALID_BASE_PATTERN = /^[ATCG]$/;

@Component({
  selector: 'app-grid',
  templateUrl: './grid.html',
  styleUrl: './grid.css',
})
export class Grid {
  dna = input<string[]>([]);
  editable = input<boolean>(false);

  dnaChange = output<string[]>();
  cellError = output<string>();

  protected readonly columns = computed(() => this.dna().length);

  protected splitRow(row: string): string[] {
    return row.split('');
  }

  protected onCellInput(rowIndex: number, colIndex: number, target: HTMLInputElement): void {
    const rawValue = target.value;

    if (rawValue.length > 1) {
      target.value = '';
      this.cellError.emit('Solo se permite un carácter por celda.');
      return;
    }

    const base = rawValue.toUpperCase();
    if (base && !VALID_BASE_PATTERN.test(base)) {
      target.value = '';
      this.cellError.emit(`"${base}" no es una base válida. Solo se permiten A, T, C o G.`);
      return;
    }

    this.dnaChange.emit(this.replaceCell(rowIndex, colIndex, base));
  }

  private replaceCell(rowIndex: number, colIndex: number, base: string): string[] {
    return this.dna().map((row, r) => {
      if (r !== rowIndex) {
        return row;
      }
      const chars = row.split('');
      chars[colIndex] = base || chars[colIndex];
      return chars.join('');
    });
  }
}
