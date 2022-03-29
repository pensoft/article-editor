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
'blockquote hr h1 h2 h3 h4 h5 h6 pre br page-break spacer figure-descriptions-container figure-description figure-component-description figure-component inline-block-container form-field form-field-inline-view form-field-inline p ol ul li math-inline math-display td th span citation'.split(' ').join('[formControlName]')
console.log(schema);
let prosemirrorTags :string[]= []
let marksAndNodes = {...schema.nodes,...schema.marks}
Object.keys(marksAndNodes).forEach((key)=>{
  let value = marksAndNodes[key];
  if(value.spec.parseDOM){
    let tag = value.spec.parseDOM[0].tag;
    if(tag){
      let actualTag = tag.includes('.')?tag.split('.')[0]:tag;
      if(!prosemirrorTags.includes(actualTag)){
        prosemirrorTags.push(actualTag);
      }
    }
  }
})
let selectionStr : string = prosemirrorTags.join('[formControlName],')+'[formControlName]';
console.log(selectionStr);
@Directive({
  selector: 'form-field[formControlName],inline-block-container[formControlName],p[formControlName],form-field-inline[formControlName],form-field-inline-view[formControlName],table[formControlName],tr[formControlName],td[formControlName],th[formControlName],img[src][formControlName],iframe[formControlName],block-figure[formControlName],figure-components-container[formControlName],figure-component[formControlName],figures-nodes-container[formControlName],figure-descriptions-container[formControlName],figure-component-description[formControlName],figure-description[formControlName],blockquote[formControlName],hr[formControlName],h1[formControlName],pre[formControlName],br[formControlName],page-break[formControlName],spacer[formControlName],math-inline[formControlName],math-display[formControlName],li[formControlName],ul[formControlName],ol[formControlName],math-select[formControlName],sub[formControlName],sup[formControlName],span[formControlName],citation[formControlName],a[href][formControlName],i[formControlName],strong[formControlName],code[formControlName],div[formControlName],u[formControlName],ychange[formControlName]',
  providers: [CUSTOM_FORM_DIRECTIVE],
})

export class FormControlNameDirective implements ControlValueAccessor {
  private innerValue: string = '';
  //@ts-ignore
  ngControl: NgControl;

  constructor(
    private el: ElementRef,
    private inj: Injector,
    private _renderer: Renderer2
  ) {

  }

  public onChange: any = () => {
    /*Empty*/
  };
  public onTouched: any = () => {
    /*Empty*/
  };

  get value(): any {
    return this.innerValue;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  writeValue(val: any): void {
    try {
      this.ngControl = this.inj.get(NgControl);
      /* if((val as string).startsWith('<form-field')){
        let temp = document.createElement('div');
        temp.innerHTML = val
        //@ts-ignore
        val=temp.firstChild?.firstChild?.innerHTML
      }
      if(typeof val !== 'string'){
        let wrapper = document.createElement('div');
        let prosemirrorNode = DOMPMParser.parse(val)
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
      this._renderer.setAttribute(
        this.el.nativeElement,
        'controlPath',
        this.ngControl.path!.join('.')
      );
      this.innerValue = val;
    } catch (e) {
      console.error(e);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
