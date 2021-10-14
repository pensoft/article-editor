import { Component } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import ContentComponent from 'formiojs/components/content/Content.js';
@Component({
  selector: 'mat-formio-content',
  template: `<div [innerHTML]="instance.component.defaultValue?instance.component.defaultValue.contentData:instance.content"></div>`
})
export class MaterialContentComponent extends MaterialComponent {
 
}
ContentComponent.MaterialComponent = MaterialContentComponent;
export { ContentComponent };
