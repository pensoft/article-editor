import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import RadioComponent from 'formiojs/components/radio/Radio.js';
import { redoItem } from 'yjs/dist/src/internals';

@Component({
  selector: 'mat-formio-radio',
  styleUrls: ['./radio.component.scss'],
  templateUrl: './radio.component.html',
})
export class MaterialRadioComponent extends MaterialComponent {
  constructor(public element: ElementRef, public ref: ChangeDetectorRef) {
    super(element,ref)
  }
  setInstance(instance: any) {
    instance.materialComponent = this;
    this.instance = instance;
    if((!this.instance.defaultValue||this.instance.defaultValue == "")&&(this.instance.dataValue&&this.instance.dataValue!==""&&this.instance.dataValue!==null&&this.instance.dataValue!==undefined)){
      //this.instance.defaultValue = this.instance.dataValue
      this.instance.updateValue(this.instance.dataValue, { modified: true });
    }
    this.control.setInstance(instance);
    this.instance.disabled = this.instance.shouldDisabled;
    this.renderComponents();
  }

  onChange(keepInputRaw?: boolean) {
    let value = this.getValue();

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }

    if (this.input && this.input.nativeElement.mask && value && !keepInputRaw) {
      this.input.nativeElement.mask.textMaskInputElement.update(value);
      this.control.setValue(this.input.nativeElement.value);
      value = this.getValue();
    }
    this.instance.updateValue(value, { modified: true });
    this.instance.root.changeVisibility(this.instance);

  }

  getLayout() {
    return this.instance.component.inline ? 'row' : 'column';
  }

  isRadioChecked(option:any,radio?:any) {
    if(radio){
      radio.checked = option.value == this.instance.dataValue;
    }
    return option.value == this.instance.dataValue;
  }

  clearValue(event:any, option:any) {
    if (this.isRadioChecked(option)) {
      event.preventDefault();
      this.deselectValue();
    }
  }

  deselectValue() {
    this.instance.updateValue(null, {
      modified: true,
    });
  }
}
RadioComponent.MaterialComponent = MaterialRadioComponent;
export { RadioComponent };
