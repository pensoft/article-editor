import { Component } from '@angular/core';
import { MaterialTextfieldComponent} from '../textfield/textfield.component';
//@ts-ignore
import PasswordComponent from 'formiojs/components/password/Password.js';
@Component({
  selector: 'mat-formio-password',
  templateUrl: './password.component.html',
  styleUrls: ['../textfield/textfield.scss'],
})
export class MaterialPasswordComponent extends MaterialTextfieldComponent {
  public inputType = 'password';
  public hide = true;
}
PasswordComponent.MaterialComponent = MaterialPasswordComponent;
export { PasswordComponent };
