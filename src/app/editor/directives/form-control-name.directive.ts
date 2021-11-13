import {Directive, ElementRef, Input, forwardRef, Optional, Injector, Renderer2} from '@angular/core';
import {AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";
import { DOMParser, DOMSerializer, Node } from 'prosemirror-model';
import { schema } from '../utils/Schema';

declare  var $:any;

export const CUSTOM_FORM_DIRECTIVE: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FormControlNameDirective),
  multi: true
};

let DOMPMParser = DOMParser.fromSchema(schema);
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

  writeValue(val: any) : void {
    try{
      this.ngControl = this.inj.get(NgControl)
      console.log('value loaded i directive',val); 
      /* if((val as string).startsWith('<form-field')){
        let temp = document.createElement('div');
        temp.innerHTML = val
        //@ts-ignore
        val=temp.firstChild?.firstChild?.innerHTML
      }
      if(typeof val !== 'string'){
        let wrapper = document.createElement('div');
        let prosemirrorNode = DOMPMParser.parse(val)
        debugger
        //@ts-ignore
        let htmlNodeRepresentation = DOMSerializer.fromSchema(schema).serializeFragment(prosemirrorNode.content.content[0]);
        wrapper.appendChild(htmlNodeRepresentation)
        //@ts-ignore
        this._renderer.setAttribute(this.el.nativeElement, 'controlPath', this.ngControl.path.join('.'));
        this.el.nativeElement.innerHTML = wrapper.innerHTML
        this.innerValue = wrapper.innerHTML;
        return
      } */
      this.el.nativeElement.innerHTML = val;
      /* this.el.nativeElement.innerHTML = `<p class="set-align-left">
     ${val}
    </p>`; */
      // @ts-ignore
      this._renderer.setAttribute(this.el.nativeElement, 'controlPath', this.ngControl.path.join('.'));
      this.innerValue = val;
    }catch(e){
      console.log(e);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
