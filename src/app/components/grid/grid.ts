import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.html',
  styleUrl: './grid.css',
})
export class Grid {
  dna = input<string[]>([]);

  protected readonly columns = computed(() => this.dna().length);

  protected splitRow(row: string): string[] {
    return row.split('');
  }
}
