import { Component } from '@angular/core';
import { MaterialTextfieldComponent} from '../textfield/textfield.component';
//@ts-ignore
import EmailComponent from 'formiojs/components/email/Email.js';
@Component({
  selector: 'mat-formio-email',
  templateUrl: '../textfield/textfield.component.html',
  styleUrls: ['../textfield/textfield.scss'],
})
export class MaterialEmailComponent extends MaterialTextfieldComponent {
  public inputType = 'email';
}
EmailComponent.MaterialComponent = MaterialEmailComponent;
export { EmailComponent };
