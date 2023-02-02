import { Component, OnInit } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import SelectComponent from 'formiojs/components/select/Select.js';
import _ from 'lodash';
@Component({
  selector: 'mat-formio-select',
  styleUrls: ['./select.component.scss'],
  templateUrl: './select.component.html',
})
export class MaterialSelectComponent extends MaterialComponent implements OnInit {
  selectOptions?: Promise<any[]>;
  filteredOptions?: Promise<any[]>;
  filteredOptionsLength?: number;

  selectOptionsResolve: any;

  setInstance(instance: any) {
    super.setInstance(instance);
    this.instance.triggerUpdate();
  }

  ngOnInit() {
    this.selectOptions = new Promise((resolve) => {
      this.selectOptionsResolve = resolve;
    });
    this.selectOptions.then((options) => {
      this.filteredOptionsLength = options.length;
    })

    this.filteredOptions = this.selectOptions;
  }

  onFilter(value1:any) {
    let value = value1.target.value
    this.filteredOptions = this.selectOptions!.then((options) => {
      const filtered =  options.filter((option) => option.label.indexOf(value) !== -1);
      this.filteredOptionsLength = filtered.length;
      return filtered;
    })
  }

  compareObjects(o1: any, o2: any): boolean {
    return _.isEqual(o1, o2);
  }
}
SelectComponent.MaterialComponent = MaterialSelectComponent;

// Make sure we detect changes when new items make their way into the select dropdown.
const setItems = SelectComponent.prototype.setItems;
SelectComponent.prototype.setItems = function(...args:any) {
  setItems.call(this, ...args);
  if (this.materialComponent && this.materialComponent.selectOptionsResolve) {
    this.materialComponent.selectOptionsResolve(this.selectOptions);
  }
};

export { SelectComponent };
