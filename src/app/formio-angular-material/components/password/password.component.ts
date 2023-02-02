import { Component } from '@angular/core';
import { MaterialTextfieldComponent} from '../textfield/textfield.component';
//@ts-ignore
import PasswordComponent from 'formiojs/components/password/Password.js';
@Component({
  selector: 'mat-formio-password',
  templateUrl: '../textfield/textfield.component.html'
})
export class MaterialPasswordComponent extends MaterialTextfieldComponent {
  public inputType = 'password';
}
PasswordComponent.MaterialComponent = MaterialPasswordComponent;
export { PasswordComponent };
