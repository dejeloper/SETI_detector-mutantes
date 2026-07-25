import {TestBed} from '@angular/core/testing';
import {DNAService} from '@app/core/services/dna.service';

describe('DNAService', () => {
  let service: DNAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DNAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isMutant', () => {
    it('should detect a mutant DNA with horizontal and diagonal sequences', () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

      const result = service.isMutant(dna);

      expect(result).toEqual({isMutant: true, hasError: false, errorMessage: null});
    });

    it('should not detect a human DNA with fewer than 2 sequences', () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATTT', 'AGACGG', 'GCGTCA', 'TCACTG'];

      const result = service.isMutant(dna);

      expect(result).toEqual({isMutant: false, hasError: false, errorMessage: null});
    });

    it('should detect vertical sequences', () => {
      const dna = ['ATCG', 'ATCG', 'ATCG', 'ATCC'];

      const result = service.isMutant(dna);

      expect(result.isMutant).toBe(true);
    });

    it('should detect diagonal ↘ sequences', () => {
      const dna = ['ATCGAT', 'GATCGA', 'TGATCG', 'CTGATC', 'GCTGAT', 'TGCTGA'];

      const result = service.isMutant(dna);

      expect(result.isMutant).toBe(true);
    });

    it('should detect diagonal ↙ sequences', () => {
      const dna = ['ATCGAT', 'AGATCG', 'ATGATC', 'GCTGAT', 'GGCTGA', 'ATGCTG'];

      const result = service.isMutant(dna);

      expect(result.isMutant).toBe(true);
    });

    it('should not count a single sequence as mutant', () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAGGG', 'CCCTTA', 'TCACTG'];

      const result = service.isMutant(dna);

      expect(result.isMutant).toBe(false);
    });

    it('should return false with no error for an empty DNA array', () => {
      const result = service.isMutant([]);

      expect(result).toEqual({isMutant: false, hasError: false, errorMessage: null});
    });

    it('should return an error when the matrix is not square', () => {
      const dna = ['ATGC', 'CAGT', 'TTAT'];

      const result = service.isMutant(dna);

      expect(result).toEqual({
        isMutant: false,
        hasError: true,
        errorMessage: 'La matriz de ADN debe ser cuadrada.'
      });
    });

    it('should return an error when the DNA contains invalid characters', () => {
      const dna = ['ATGX', 'CAGT', 'TTAT', 'AGAA'];

      const result = service.isMutant(dna);

      expect(result).toEqual({
        isMutant: false,
        hasError: true,
        errorMessage: 'El ADN contiene caracteres inválidos.'
      });
    });

    it('should not detect a sequence that goes out of matrix bounds', () => {
      const dna = ['AAAT', 'TGCA', 'CGAT', 'GATC'];

      const result = service.isMutant(dna);

      expect(result.isMutant).toBe(false);
    });
  });

  describe('generateRandom', () => {
    it('should generate a square matrix of the requested size', () => {
      const dna = service.generateRandom(6);

      expect(dna.length).toBe(6);
      dna.forEach((row) => expect(row.length).toBe(6));
    });

    it('should only use valid bases (A, T, C, G)', () => {
      const dna = service.generateRandom(8);

      dna.forEach((row) => expect(row).toMatch(/^[ATCG]+$/));
    });
  });
});
