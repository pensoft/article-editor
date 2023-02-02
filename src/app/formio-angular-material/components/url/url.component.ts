import { Component } from '@angular/core';
import { MaterialTextfieldComponent} from '../textfield/textfield.component';
//@ts-ignore
import UrlComponent from 'formiojs/components/url/Url.js';
@Component({
  selector: 'mat-formio-url',
  templateUrl: '../textfield/textfield.component.html',
})
export class MaterialUrlComponent extends MaterialTextfieldComponent {
  public inputType = 'url';
}
UrlComponent.MaterialComponent = MaterialUrlComponent;
export { UrlComponent };
