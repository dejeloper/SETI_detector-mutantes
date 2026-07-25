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

  describe('scan', () => {
    it('should return no steps for an empty DNA array', () => {
      const result = service.scan([]);

      expect(result).toEqual({hasError: false, errorMessage: null, isMutant: false, steps: []});
    });

    it('should return an error with no steps when the matrix is not square', () => {
      const dna = ['ATGC', 'CAGT', 'TTAT'];

      const result = service.scan(dna);

      expect(result).toEqual({
        hasError: true,
        errorMessage: 'La matriz de ADN debe ser cuadrada.',
        isMutant: false,
        steps: []
      });
    });

    it('should return an error with no steps when the DNA contains invalid characters', () => {
      const dna = ['ATGX', 'CAGT', 'TTAT', 'AGAA'];

      const result = service.scan(dna);

      expect(result).toEqual({
        hasError: true,
        errorMessage: 'El ADN contiene caracteres inválidos.',
        isMutant: false,
        steps: []
      });
    });

    it('should stop recording steps as soon as the second matching sequence is found', () => {
      const dna = ['ATCG', 'ATCG', 'ATCG', 'ATCC'];

      const result = service.scan(dna);

      expect(result.isMutant).toBe(true);
      const matchedSteps = result.steps.filter((step) => step.matched);
      expect(matchedSteps.length).toBe(2);
      expect(result.steps[result.steps.length - 1].matched).toBe(true);
    });

    it('should describe each step with a direction, 4 cells and whether it matched', () => {
      const dna = ['ATCG', 'ATCG', 'ATCG', 'ATCC'];

      const result = service.scan(dna);

      result.steps.forEach((step) => {
        expect(['horizontal', 'vertical', 'diagonal-derecha', 'diagonal-izquierda']).toContain(step.direction);
        expect(step.cells.length).toBe(4);
        expect(typeof step.matched).toBe('boolean');
      });

      expect(result.steps[0]).toEqual({
        direction: 'horizontal',
        cells: [
          {row: 0, col: 0},
          {row: 0, col: 1},
          {row: 0, col: 2},
          {row: 0, col: 3}
        ],
        matched: false
      });
    });

    it('should traverse every possible step without cutting for a human DNA with no sequences', () => {
      const dna = ['ATGC', 'CGTA', 'GCAT', 'TACG'];

      const result = service.scan(dna);

      expect(result.isMutant).toBe(false);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps.every((step) => !step.matched)).toBe(true);
    });
  });

  describe('documented edge cases', () => {
    it('Case 1 — empty matrix: cuts before reaching validateShape', () => {
      const result = service.isMutant([]);

      expect(result).toEqual({hasError: false, errorMessage: null, isMutant: false});
    });

    it('Case 2 — valid matrix (mutant example): passes validateShape and detects 2 sequences', () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

      const result = service.isMutant(dna);

      expect(result).toEqual({hasError: false, errorMessage: null, isMutant: true});
    });

    it('Case 3 — non-square matrix: cuts at the first row whose length does not match size', () => {
      const dna = ['ATGC', 'CGTA', 'TTAAA'];

      const result = service.isMutant(dna);

      expect(result).toEqual({
        hasError: true,
        errorMessage: 'La matriz de ADN debe ser cuadrada.',
        isMutant: false
      });
    });

    it('Case 4 — invalid character: cuts at the row containing the disallowed character', () => {
      const dna = ['ATGC', 'CGTA', 'TTXA', 'GGCC'];

      const result = service.isMutant(dna);

      expect(result).toEqual({
        hasError: true,
        errorMessage: 'El ADN contiene caracteres inválidos.',
        isMutant: false
      });
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
