/* import {Injectable} from '@angular/core';
import {FormArray, FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import {UltimateService} from '../../shared/ultimate.service';

declare module '@angular/forms' {
  interface FormControl {
    addValidators(validators: ValidatorFn[]): void;

    removeValidators(validators: ValidatorFn[]): void;
  }
}

FormControl.prototype.addValidators = function (this: FormControl, validators: ValidatorFn[]) {
  if (!validators || !validators.length) {
    return;
  }
  this.clearValidators();
  this.setValidators(this.validator ? [this.validator, ...validators] : validators);
};

FormControl.prototype.removeValidators = function (this: FormControl, validators: ValidatorFn[]) {
  if (!validators || !validators.length) {
    return;
  }
  const index = validators.findIndex(item => item !== Validators[key]);
  validators.splice(index, 1);

  this.clearValidators();
  this.setValidators(this.validator ? [this.validator, ...validators] : validators);
};

@Injectable({
  providedIn: 'root'
})
export class UltimateFormBuilderService {

  currentForm;

  constructor(private ultimateService: UltimateService) {
  }

  toFormGroup(columns: any[], options?: { languageTemplate?, formGroup?, index? }) {
    const myForm = options?.formGroup ? options.formGroup : new FormGroup({});
    if (options?.languageTemplate) {
      this.resolve({data: options.languageTemplate}, myForm, localStorage.getItem('language'));
    }

    columns.map(cell => {
      this.resolve(cell, myForm);
    });
    this.currentForm = myForm;
    return myForm;
  }

  addGroupToFormArray(columns: any[], {formArray, formArrayName, index}) {
    const group = formArray[index] || new FormGroup({});
    formArray[index] = group;
    columns.map(cell => {
      // TODO could add value!
      const control = this.resolve(cell, group);
      control.currentIndex = index;
      cell.data = `${formArrayName}.${index}.${cell.data}`;
      if (cell.readOnly) {
        control.disable();
      }
    });
  }

  resolve(cell, group, value = '', separator = '.') {
    if (cell.data.indexOf(separator) > -1) {
      const properties = Array.isArray(cell.data) ? cell.data : cell.data.split(separator);
      return properties.reduce((prev, curr, index) => {
        if (!prev.get(curr)) {
          if (index === properties.length - 1) {
            const control = new FormControl({value, disabled: cell.readOnly});
            prev.addControl(curr, control);
          } else {
            prev.addControl(curr, new FormGroup({}));
          }
        }
        return prev.get(curr);
      }, group);

    } else {
      let control;
      let controls = group.controls || group.control.controls;
      if (!controls.hasOwnProperty(cell.data)) {
        if (cell.formArray) {
          control = new FormArray([]);
        } else {
          control = new FormControl({value, disabled: cell.readOnly});
        }
        group.addControl(cell.data, control);
      } else {
        control = controls[cell.data];
      }
      return control;
    }
  }

  createFormFromTemplate(formGroup, columns: any) {
    const controls = [];
    columns.map(item => {

      // Expansion template
      if (item.expansionTemplate) {
        item.columns.forEach(subItem => {
          subItem.data = `${item.data}.${subItem.data}`;
          controls.push(subItem);
        });
      } else if (typeof item.data === 'string') {
        controls.push(item);
      } else if (typeof item.data === 'object') {
        Object.keys(item.data).map(prop => {
          const newControl = {...item, data: item.data[prop]};
          controls.push(newControl);
        });
      }
    });
    formGroup = this.toFormGroup(controls, { formGroup });
    return formGroup;
  }

  deepResponseAsign(formGroup: FormGroup, response: any) {
    Object.keys(response).map(item => {
      if(this.isObject(response[item]) && !Array.isArray(response[item])) {
        let newFormGroup = formGroup.get(item) as FormGroup || new FormGroup({});
        formGroup.addControl(item, newFormGroup);
        this.deepResponseAsign(newFormGroup, response[item]);
      } else {
        if(typeof formGroup.getRawValue === 'function') {
          if(!formGroup.getRawValue().hasOwnProperty(item)) {
            formGroup.addControl(item, new FormControl());
          }
        }
      }
    });
  }

  fillFormWithResponseValues(formGroup: FormGroup, gridSettings: any, response: any) {

    this.deepResponseAsign(formGroup, response);
    formGroup.patchValue(response);

    // Multilang template
    let multiLang = gridSettings.settings.columns.filter(({ editor }) => editor === 'MultiLanguage')[0];
    if (multiLang) {
      let allLanguages: any = '';
      this.ultimateService.$languages.subscribe(langs => allLanguages = langs);
      allLanguages = allLanguages ? allLanguages.split(',') : [];
      if(response.title?.language && allLanguages.indexOf(response.title?.language) === -1) {
        allLanguages.push(response.title?.language);
      }
      allLanguages.forEach(language => {
        multiLang.columns.forEach(item => {
          let control = formGroup.get(item.multiLangTemplate.replace('*', language));
          if (!control) {
            control = this.resolve({ data: item.multiLangTemplate.replace('*', language) }, formGroup);
          }
        });
        let langControl = formGroup.get(multiLang.multiLangTemplate.replace('*', language));
        if(!langControl) {
          langControl = this.resolve({ data: multiLang.multiLangTemplate.replace('*', language) }, formGroup, language);
        }
      });
    }

    Object.keys(response).map(key => {
      if (Array.isArray(response[key]) && formGroup.get(key) instanceof FormArray) {
        let currentFormArray = formGroup.get(key) as FormArray;
        const setting = gridSettings.settings.columns.filter(({data}) => data === key)[0];
        if(setting) {
          if(!setting.keepArray) {
            currentFormArray.clear();
          }
          // If initDefault is true and there are no items in the response,
          // fill the form array with 1 default(empty) element
          (response[key].length === 0 && setting.initDefault ? [{}] : response[key]).forEach((responseItem, index) => {
            let newFormGroup = this.toFormGroup([]);
            if (setting?.template?.settings?.header) {
              setting.template.settings.header.forEach(templateItem => {
                let value = responseItem[templateItem.data];
                this.applyCommonProps(templateItem, setting.template.settings);
                let formControl = this.resolve(templateItem, newFormGroup, value);
                formControl['currentIndex'] = index;
                formControl['manualChange'] = 'false';
              });
            }

            if (setting?.template?.settings?.expandable) {
              setting.template.settings.expandable.forEach(templateItem => {
                let value = responseItem[templateItem.data];
                this.applyCommonProps(templateItem, setting.template.settings);
                let formControl = this.resolve(templateItem, newFormGroup, value);
                formControl['currentIndex'] = index;
                formControl['manualChange'] = 'false';
              });
            }

            if (setting?.arrayColumns) {
              setting.arrayColumns.forEach(templateItem => {
                let value = responseItem[templateItem.data];
                this.applyCommonProps(templateItem, setting.arrayColumns);
                let formControl = this.resolve(templateItem, newFormGroup, value);
                formControl['currentIndex'] = index;
                formControl['manualChange'] = 'false';
              });
            }

            currentFormArray.push(newFormGroup);
          });
        }
      }
    });
  }

  fillFormWithDefaultValues(formGroup: any, dataSchema: any) {
    const formFields = formGroup.getRawValue();
    Object.keys(dataSchema).map(item => {
      if (!formFields.hasOwnProperty(item)) {
        formGroup.addControl(item, new FormControl(dataSchema[item]));
      } else {
        formGroup.get(item).patchValue(dataSchema[item]);
      }
    });
  }

  applyCommonProps(item, settings) {
    if (settings.common) {
      let commonProps = settings.common;
      Object.keys(commonProps).forEach(commonKey => {
        if (!item.hasOwnProperty(commonKey)) {
          let commonProp = commonProps[commonKey];
          item[commonKey] = JSON.parse(JSON.stringify(commonProp).replace(/\g, item.data));
        }
      });
    }
  }

  isObject(o) {
    return o !== null && o !== undefined && typeof o === 'object';
  }
}
 */