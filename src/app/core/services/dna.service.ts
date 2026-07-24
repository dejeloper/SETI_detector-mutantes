import {Injectable} from '@angular/core';
import {DNAMutantResult, DNAValidationResult} from '@app/core/models/dna-result.model';

interface Direction {
  dx: number;
  dy: number;
}

const SEQUENCE_LENGTH = 4;
const MIN_SEQUENCES_FOR_MUTANT = 2;
// solo se permiten las bases A, T, C, G
const VALID_BASES_PATTERN = /^[ATCG]+$/;
const DIRECTIONS: Direction[] = [
  {dx: 0, dy: 1}, // horizontal
  {dx: 1, dy: 0}, // vertical
  {dx: 1, dy: 1}, // diagonal ↘
  {dx: 1, dy: -1} // diagonal ↙
];

@Injectable({
  providedIn: 'root'
})
export class DNAService {
  readonly mutantDNAExample: string[] = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];
  readonly humanDNAExample: string[] = ['ATGCGA', 'CAGTGC', 'TTATTT', 'AGACGG', 'GCGTCA', 'TCACTG'];

  validate(): string {
    return 'ADN validado';
  }

  isMutant(dna: string[]): DNAMutantResult {
    if (dna.length === 0) {
      return {isMutant: false, hasError: false, errorMessage: null};
    }

    // valida que sea cuadrada y que solo tenga bases válidas
    const validation = this.validateShape(dna);
    if (validation.hasError) {
      return {isMutant: false, ...validation};
    }

    // es mutante si encuentra 2 o más secuencias de 4 bases iguales
    const isMutant = this.countSequences(dna) >= MIN_SEQUENCES_FOR_MUTANT;
    return {isMutant, hasError: false, errorMessage: null};
  }

  private validateShape(dna: string[]): DNAValidationResult {
    const size = dna.length;

    // esto valida que la matriz sea cuadrada y tenga caracteres válidos
    for (const row of dna) {
      if (row.length !== size) {
        return {hasError: true, errorMessage: 'La matriz de ADN debe ser cuadrada.'};
      }
      if (!VALID_BASES_PATTERN.test(row)) {
        return {hasError: true, errorMessage: 'El ADN contiene caracteres inválidos.'};
      }
    }

    return {hasError: false, errorMessage: null};
  }

  private countSequences(dna: string[]): number {
    let sequences = 0;

    for (let row = 0; row < dna.length; row++) {
      for (let col = 0; col < dna.length; col++) {
        sequences += this.countSequencesFrom(dna, row, col);
        // corta apenas se llega al mínimo, no hace falta seguir buscando
        if (sequences >= MIN_SEQUENCES_FOR_MUTANT) {
          return sequences;
        }
      }
    }

    return sequences;
  }

  private countSequencesFrom(dna: string[], row: number, col: number): number {
    return DIRECTIONS.filter((direction) => this.hasSequence(dna, row, col, direction)).length;
  }

  // compara cada base siguiente contra la base inicial
  private hasSequence(dna: string[], row: number, col: number, direction: Direction): boolean {
    if (!this.fitsInMatrix(dna.length, row, col, direction)) {
      return false;
    }

    const base = dna[row][col];

    for (let step = 1; step < SEQUENCE_LENGTH; step++) {
      const currentRow = row + direction.dx * step;
      const currentCol = col + direction.dy * step;
      if (dna[currentRow][currentCol] !== base) {
        return false;
      }
    }

    return true;
  }

  // calcula la celda final de la secuencia y revisa que quede dentro de la matriz
  private fitsInMatrix(size: number, row: number, col: number, direction: Direction): boolean {
    const endRow = row + direction.dx * (SEQUENCE_LENGTH - 1);
    const endCol = col + direction.dy * (SEQUENCE_LENGTH - 1);
    return endRow >= 0 && endRow < size && endCol >= 0 && endCol < size;
  }
}
