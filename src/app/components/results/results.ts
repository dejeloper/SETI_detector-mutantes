import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {HumanIcon} from '@app/components/icons/human-icon/human-icon';
import {MutantIcon} from '@app/components/icons/mutant-icon/mutant-icon';

export type ResultStatus = 'neutral' | 'error' | 'mutant' | 'safe';

@Component({
  selector: 'app-results',
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  message = input<string>('');
  status = input<ResultStatus>('neutral');
}
