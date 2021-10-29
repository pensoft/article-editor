import {Directive, ElementRef, Input, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

declare  var $:any;

export const CUSTOM_FORM_DIRECTIVE: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormArrayNameDirective),
  multi: true
};

@Directive({
  selector: '*:not(input):not(textarea)[formArrayName]',
  providers: [CUSTOM_FORM_DIRECTIVE]
})
export class FormArrayNameDirective implements ControlValueAccessor {
  private innerValue: string = '';

  constructor(private el: ElementRef) {
  }

  public onChange: any = () => { /*Empty*/ }
  public onTouched: any = () => { /*Empty*/ }

  get value(): any {
    return this.innerValue;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  writeValue(val: string) : void {
    this.innerValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
