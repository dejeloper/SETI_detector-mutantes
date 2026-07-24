export interface DNAValidationResult {
  hasError: boolean;
  errorMessage: string | null;
}

export interface DNAMutantResult extends DNAValidationResult {
  isMutant: boolean;
}
