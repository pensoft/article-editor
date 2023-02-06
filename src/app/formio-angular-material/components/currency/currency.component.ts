import { Component } from '@angular/core';
import { MaterialNumberComponent } from '../number/number.component';
//@ts-ignore
import CurrencyComponent from 'formiojs/components/currency/Currency.js';
import _ from 'lodash';

@Component({
  selector: 'mat-formio-currency',
  templateUrl: '../textfield/textfield.component.html',
  styleUrls: ['../textfield/textfield.scss'],
})
export class MaterialCurrencyComponent extends MaterialNumberComponent {
  public inputType = 'text';

  onChange() {
    const newValue = _.isNil(this.getValue()) ? '' : this.getValue();
    this.instance.updateValue(newValue, {modified: true});
    this.instance.root.changeVisibility(this.instance);

  }
}
CurrencyComponent.MaterialComponent = MaterialCurrencyComponent;
export { CurrencyComponent };
