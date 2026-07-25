import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Buttons} from '@app/components/buttons/buttons';

describe('Buttons', () => {
  let fixture: ComponentFixture<Buttons>;
  let component: Buttons;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [Buttons]});
    fixture = TestBed.createComponent(Buttons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function clickButton(index: number): void {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    buttons[index].click();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit loadMutant exactly once when Demo Mutante is clicked', () => {
    let count = 0;
    component.loadMutant.subscribe(() => count++);

    clickButton(0);

    expect(count).toBe(1);
  });

  it('should emit loadHuman exactly once when Demo Humano is clicked', () => {
    let count = 0;
    component.loadHuman.subscribe(() => count++);

    clickButton(1);

    expect(count).toBe(1);
  });

  it('should emit randomize exactly once when Generar aleatorio is clicked', () => {
    let count = 0;
    component.randomize.subscribe(() => count++);

    clickButton(2);

    expect(count).toBe(1);
  });

  it('should emit validate exactly once when Validar ADN is clicked', () => {
    let count = 0;
    component.validate.subscribe(() => count++);

    clickButton(3);

    expect(count).toBe(1);
  });

  it('should emit edit exactly once when Editar ADN is clicked', () => {
    let count = 0;
    component.edit.subscribe(() => count++);

    clickButton(4);

    expect(count).toBe(1);
  });

  it('should emit stepThrough exactly once when Paso a paso is clicked', () => {
    let count = 0;
    component.stepThrough.subscribe(() => count++);

    clickButton(5);

    expect(count).toBe(1);
  });

  describe('while stepping is active', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('stepping', true);
      fixture.detectChanges();
    });

    it('should render the play/pause and next controls alongside the step button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(8);
    });

    it('should emit togglePlayback exactly once when Pausar/Reanudar is clicked', () => {
      let count = 0;
      component.togglePlayback.subscribe(() => count++);

      clickButton(6);

      expect(count).toBe(1);
    });

    it('should emit nextStep exactly once when Siguiente is clicked', () => {
      let count = 0;
      component.nextStep.subscribe(() => count++);

      clickButton(7);

      expect(count).toBe(1);
    });
  });
});
