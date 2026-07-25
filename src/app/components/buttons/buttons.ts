import {Component, input, output} from '@angular/core';
import {MutantIcon} from '@app/components/icons/mutant-icon/mutant-icon';
import {HumanIcon} from '@app/components/icons/human-icon/human-icon';
import {MicroscopeIcon} from '@app/components/icons/microscope-icon/microscope-icon';
import {ShuffleIcon} from '@app/components/icons/shuffle-icon/shuffle-icon';
import {PencilIcon} from '@app/components/icons/pencil-icon/pencil-icon';
import {DnaIcon} from '@app/components/icons/dna-icon/dna-icon';

@Component({
  selector: 'app-buttons',
  imports: [MutantIcon, HumanIcon, MicroscopeIcon, ShuffleIcon, PencilIcon, DnaIcon],
  templateUrl: './buttons.html',
  styleUrl: './buttons.css'
})
export class Buttons {
  editing = input<boolean>(false);
  stepping = input<boolean>(false);
  stepPlaying = input<boolean>(false);
  stepFinished = input<boolean>(false);

  loadMutant = output<void>();
  loadHuman = output<void>();
  randomize = output<void>();
  validate = output<void>();
  edit = output<void>();
  stepThrough = output<void>();
  togglePlayback = output<void>();
  nextStep = output<void>();

  protected onLoadMutant(): void {
    this.loadMutant.emit();
  }

  protected onLoadHuman(): void {
    this.loadHuman.emit();
  }

  protected onRandomize(): void {
    this.randomize.emit();
  }

  protected onValidate(): void {
    this.validate.emit();
  }

  protected onEdit(): void {
    this.edit.emit();
  }

  protected onStepThrough(): void {
    this.stepThrough.emit();
  }

  protected onTogglePlayback(): void {
    this.togglePlayback.emit();
  }

  protected onNextStep(): void {
    this.nextStep.emit();
  }
}
