import {Injectable} from '@angular/core';
import {DNAMutantResult} from '@app/core/models/dna-result.model';
import {DNAStep, DNAStepCell, DNAStepDirection, DNAStepScanResult} from '@app/core/models/dna-step.model';

interface Direction {
  dx: number;
  dy: number;
  name: DNAStepDirection;
}

const SEQUENCE_LENGTH = 4;
const MIN_SEQUENCES_FOR_MUTANT = 2;
// solo se permiten las bases A, T, C, G
const VALID_BASES_PATTERN = /^[ATCG]+$/;
const BASES = ['A', 'T', 'C', 'G'] as const;
const DIRECTIONS: Direction[] = [
  {dx: 0, dy: 1, name: 'horizontal'},
  {dx: 1, dy: 0, name: 'vertical'},
  {dx: 1, dy: 1, name: 'diagonal-derecha'},
  {dx: 1, dy: -1, name: 'diagonal-izquierda'}
];

@Injectable({
  providedIn: 'root'
})
export class DNAService {
  readonly mutantDNAExample: string[] = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];
  readonly humanDNAExample: string[] = ['ATGCGA', 'CAGTGC', 'TTATTT', 'AGACGG', 'GCGTCA', 'TCACTG'];

  // genera una matriz cuadrada de bases aleatorias del tamaño indicado
  generateRandom(size: number): string[] {
    return Array.from({length: size}, () => this.generateRandomRow(size));
  }

  // genera una fila de bases aleatorias
  private generateRandomRow(size: number): string {
    return Array.from({length: size}, () => this.randomBase()).join('');
  }

  // elige una base al azar entre A, T, C y G
  private randomBase(): string {
    return BASES[Math.floor(Math.random() * BASES.length)];
  }

  // valida el ADN y determina si es mutante (2 o más secuencias)
  isMutant(dna: string[]): DNAMutantResult {
    if (dna.length === 0) {
      return {hasError: false, errorMessage: null, isMutant: false};
    }

    const errorMessage = this.validateShape(dna);
    if (errorMessage) {
      return {hasError: true, errorMessage, isMutant: false};
    }

    return {hasError: false, errorMessage: null, isMutant: this.hasMutantSequences(dna)};
  }

  // igual que isMutant, pero además devuelve cada comparación hecha (para animar el recorrido)
  scan(dna: string[]): DNAStepScanResult {
    if (dna.length === 0) {
      return {hasError: false, errorMessage: null, isMutant: false, steps: []};
    }

    const errorMessage = this.validateShape(dna);
    if (errorMessage) {
      return {hasError: true, errorMessage, isMutant: false, steps: []};
    }

    const steps: DNAStep[] = [];
    let matches = 0;

    for (let row = 0; row < dna.length; row++) {
      for (let col = 0; col < dna.length; col++) {
        for (const direction of DIRECTIONS) {
          const cells = this.buildCells(dna.length, row, col, direction);
          if (!cells) {
            continue;
          }

          const matched = this.allCellsEqual(dna, cells);
          steps.push({direction: direction.name, cells, matched});

          if (!matched) {
            continue;
          }

          matches++;
          if (matches >= MIN_SEQUENCES_FOR_MUTANT) {
            return {hasError: false, errorMessage: null, isMutant: true, steps};
          }
        }
      }
    }

    return {hasError: false, errorMessage: null, isMutant: false, steps};
  }

  // recorre el tablero sin construir los objetos de paso, ya que isMutant() no los necesita
  private hasMutantSequences(dna: string[]): boolean {
    const size = dna.length;
    let matches = 0;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        for (const direction of DIRECTIONS) {
          if (!this.isSequenceInBounds(size, row, col, direction)) {
            continue;
          }

          if (!this.hasMatchingSequence(dna, row, col, direction)) {
            continue;
          }

          matches++;
          if (matches >= MIN_SEQUENCES_FOR_MUTANT) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // revisa si una secuencia de 4 bases desde (row, col) en esa dirección cabe en la matriz
  private isSequenceInBounds(size: number, row: number, col: number, direction: Direction): boolean {
    const endRow = row + direction.dx * (SEQUENCE_LENGTH - 1);
    const endCol = col + direction.dy * (SEQUENCE_LENGTH - 1);
    return endRow >= 0 && endRow < size && endCol >= 0 && endCol < size;
  }

  // compara cada base siguiente contra la base inicial
  private hasMatchingSequence(dna: string[], row: number, col: number, direction: Direction): boolean {
    const base = dna[row][col];
    for (let step = 1; step < SEQUENCE_LENGTH; step++) {
      if (dna[row + direction.dx * step][col + direction.dy * step] !== base) {
        return false;
      }
    }
    return true;
  }

  // valida que la matriz sea cuadrada y solo tenga bases válidas
  private validateShape(dna: string[]): string | null {
    const size = dna.length;

    for (const row of dna) {
      if (row.length !== size) {
        return 'La matriz de ADN debe ser cuadrada.';
      }
      if (!VALID_BASES_PATTERN.test(row)) {
        return 'El ADN contiene caracteres inválidos.';
      }
    }

    return null;
  }

  // calcula las 4 celdas de una posible secuencia, o null si no cabe en la matriz
  private buildCells(size: number, row: number, col: number, direction: Direction): DNAStepCell[] | null {
    if (!this.isSequenceInBounds(size, row, col, direction)) {
      return null;
    }

    return Array.from({length: SEQUENCE_LENGTH}, (_, step) => ({
      row: row + direction.dx * step,
      col: col + direction.dy * step
    }));
  }

  // true si todas las celdas dadas tienen la misma base
  private allCellsEqual(dna: string[], cells: DNAStepCell[]): boolean {
    const base = dna[cells[0].row][cells[0].col];
    return cells.every((cell) => dna[cell.row][cell.col] === base);
  }
}
