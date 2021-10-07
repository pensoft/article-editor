import { AfterContentInit, AfterViewInit, Component } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import ContentComponent from 'formiojs/components/content/Content.js';
@Component({
  selector: 'mat-formio-content',
  template: `<div [innerHTML]="control.value.contentData"></div>`
})
export class MaterialContentComponent extends MaterialComponent implements AfterViewInit {
  value?:any
  ngAfterViewInit(){
    this.value = this.control.value.contentData;
  }
}
ContentComponent.MaterialComponent = MaterialContentComponent;
export { ContentComponent };
