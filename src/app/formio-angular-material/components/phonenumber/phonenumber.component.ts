import { Component } from '@angular/core';
import { MaterialTextfieldComponent} from '../textfield/textfield.component';
//@ts-ignore
import PhoneNumberComponent from 'formiojs/components/phonenumber/PhoneNumber.js';
@Component({
  selector: 'mat-formio-phonenumber',
  templateUrl: '../textfield/textfield.component.html',
  styleUrls: ['../textfield/textfield.scss'],
})
export class MaterialPhoneNumberComponent extends MaterialTextfieldComponent {
  public inputType = 'text';
}
PhoneNumberComponent.MaterialComponent = MaterialPhoneNumberComponent;
export { PhoneNumberComponent };
