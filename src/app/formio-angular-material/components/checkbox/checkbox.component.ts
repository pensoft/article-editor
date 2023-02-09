import { Component } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import CheckboxComponent from 'formiojs/components/checkbox/Checkbox.js';
import _ from 'lodash';

@Component({
  selector: 'mat-formio-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls:['./checkbox.component.scss'],
})
export class MaterialCheckboxComponent extends MaterialComponent {
  getValue() {
    return _.isNil(this.control.value) ? '' : this.control.value;
  }
}
CheckboxComponent.MaterialComponent = MaterialCheckboxComponent;
export { CheckboxComponent };
