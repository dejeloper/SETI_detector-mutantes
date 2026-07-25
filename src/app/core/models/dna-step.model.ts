export interface DNAStepCell {
  row: number;
  col: number;
}

export type DNAStepDirection = 'horizontal' | 'vertical' | 'diagonal-derecha' | 'diagonal-izquierda';

export interface DNAStep {
  direction: DNAStepDirection;
  cells: DNAStepCell[];
  matched: boolean;
}

export interface DNAStepScanResult {
  hasError: boolean;
  errorMessage: string | null;
  isMutant: boolean;
  steps: DNAStep[];
}
