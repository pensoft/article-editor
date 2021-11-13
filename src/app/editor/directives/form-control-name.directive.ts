import {Directive, ElementRef, Input, forwardRef, Optional, Injector, Renderer2} from '@angular/core';
import {AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";

declare  var $:any;

export const CUSTOM_FORM_DIRECTIVE: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormControlNameDirective),
  multi: true
};

@Directive({
  selector: '*:not(input):not(textarea)[formControlName]',
  providers: [CUSTOM_FORM_DIRECTIVE]
})
export class FormControlNameDirective implements ControlValueAccessor {
  private innerValue: string = '';
  //@ts-ignore
  ngControl: NgControl;

  constructor(private el: ElementRef, private inj: Injector,  private _renderer: Renderer2) {
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
    this.ngControl = this.inj.get(NgControl)
    this.el.nativeElement.innerHTML = val;
    /* this.el.nativeElement.innerHTML = `<p class="set-align-left">
   ${val}
  </p>`; */
    // @ts-ignore
    this._renderer.setAttribute(this.el.nativeElement, 'controlPath', this.ngControl.path.join('.'));
    this.innerValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
