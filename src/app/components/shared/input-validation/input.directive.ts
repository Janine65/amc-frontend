import { Directive, ElementRef, signal, inject, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, Validators } from '@angular/forms';
import { InputPatterns } from './patterns';
import { InputValidators } from './validators';

@Directive({
  selector: '[crinput]',
  providers: [{ provide: NG_VALIDATORS, multi: true, useExisting: InputDirective }],
  exportAs: 'crinput',
})
export class InputDirective implements Validator {
  private el = inject(ElementRef);


  readonly min = input<number>(undefined);
  readonly max = input<number>(undefined);
  readonly minlength = input<number>(undefined);
  readonly maxlength = input<number>(undefined);
  readonly block = input<[
    number,
    number
]>(undefined);
  readonly pattern = input<string>(undefined);
  readonly crpattern = input<string>(undefined);
  readonly email = input<boolean>(undefined);

  readonly validator = input<string>(undefined);
  readonly params = input<any>(undefined);


  public get element(): HTMLElement {
    return this.el.nativeElement;
  };

  public errorText = signal('Required');

  validate(control: AbstractControl): ValidationErrors | null {

    const validator = this.validator();
    if (validator) {

      const _validator = InputValidators.get(validator);
      if (_validator && !control.hasValidator(_validator)) {
        // if params:
        const params = this.params();
        if (params) {
          control.addValidators(_validator(params));
        } else {
          control.addValidators(_validator);
        }
      }
    }
    this.errorText.set('Required');
    const min = this.min();
    if (min && control.value) {
      if (Validators.min(min)(control)) {
        this.errorText.set('Too small');
      }
    }

    const max = this.max();
    if (max && control.value) {
      if (Validators.max(max)(control)) {
        this.errorText.set('Too large');
      }
    }

    const minlength = this.minlength();
    if (minlength && control.value) {
      if (Validators.minLength(minlength)(control)) {
        this.errorText.set('Too short');
      }
    }

    const maxlength = this.maxlength();
    if (maxlength && control.value) {
      if (Validators.maxLength(maxlength)(control)) {
        this.errorText.set('Too long');
      }
    }


    const block = this.block();
    if (block) {
      // its valid if the value is outside the block array
      if (control.value >= block[0] && control.value <= block[1]) {
        this.errorText.set('Invalid number');
        return {
          block: true
        }
      }
    }

    if(this.pattern()) {
      this.errorText.set('Invalid format');
    }
    if(this.email()) {
      this.errorText.set('Invalid email format');
    }

    const crpattern = this.crpattern();
    if(crpattern) {

      this.errorText.set('Invalid format');
      // if pattern exists in our list, use validators
      const _pattern = InputPatterns.get(crpattern);
      if (_pattern) {
        this.errorText.set(`Invalid ${crpattern} format`);

        return Validators.pattern(_pattern)(control);
      }

    }
    return null;

  }
}
