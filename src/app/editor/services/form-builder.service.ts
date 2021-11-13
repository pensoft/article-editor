import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { pmMaxLength,pmMinLength,pmPattern,pmRequired } from '../utils/pmEditorFormValidators/validators';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

  populateDefaultValues(savedForm: any, schema: any) {
    for (let index = 0; index < schema.components.length; index++) {
      const component:any = schema.components[index];
      const componentKey:string = component['key'];
      const componentType:string = (component['type'] as string).toLocaleLowerCase();

      if( //avoids non-dynamic (non-filled) elements
        componentType === 'button' || // a button
        componentType === 'content')  // plain text and not an input field
      { continue;}
      if(savedForm[componentKey]){
        component.defaultValue = savedForm[componentKey];
      }
    }
    return schema;
  }

  buildFormGroupFromSchema(formGroup: FormGroup, jsonSchema: any) {

    formGroup = formGroup || new FormGroup({});

    if (!jsonSchema.components) {
      return formGroup;
    }

    jsonSchema.components.forEach((component: any) => {
      this.resolveComponent(formGroup, component);
    });
    return formGroup;
  }

  resolveComponent(formGroup: FormGroup, component: any) {

    if (component.type == 'datagrid') {

      let formArray = new FormArray([]);

      for (let i = 0; i < component.defaultValue?.length || 0; i++) {
        let rowFormGroup = new FormGroup({});
        component.components?.forEach((subComponent: any) => {
          let formControl = this.resolveComponent(rowFormGroup, subComponent);
          if (formControl) {
            rowFormGroup.addControl(subComponent.key, formControl);
          }
        });
        formArray.push(rowFormGroup);
      }
      formGroup.addControl(component.key, formArray);

    } else {

      let formControl = this.resolveFormControl(component);
      if (formControl) {
        formGroup.addControl(component.key, formControl);
      }
    }
    return formGroup;
  }

  resolveFormControl(component: any) {

    if (component.key === 'submit') {
      return null;
    }

    let value = component.defaultValue;
    if(component.type == 'prosemirror-editor-field'){
      let validators = component.type === 'number' ? [Validators.pattern("^[0-9]*$")] : [];
      if (component.validate) {
        if (component.validate.required) {
          validators.push(pmRequired);
        }
        if (component.validate.minLength) {
          validators.push(pmMinLength(component.validate.minLength));
        }
        if (component.validate.maxLength) {
          validators.push(pmMaxLength(component.validate.maxLength));
        }
        if (component.validate.pattern) {
          validators.push(pmPattern(component.validate.pattern)!);
        }
      }
      if (component.readOnly) {
        console.log('component.readOnly', component.readOnly);
      }
      let control = new FormControl(value, validators);
      component.readOnly ? control.disable() : undefined
      //@ts-ignore
      control.componentType = component.type
      return control
    }
    let validators = component.type === 'number' ? [Validators.pattern("^[0-9]*$")] : [];
    if (component.validate) {
      if (component.validate.required) {
        validators.push(Validators.required);
      }
      if (component.validate.minLength) {
        validators.push(Validators.minLength(component.validate.minLength));
      }
      if (component.validate.maxLength) {
        validators.push(Validators.maxLength(component.validate.maxLength));
      }
      if (component.validate.pattern) {
        validators.push(Validators.pattern(component.validate.pattern));
      }
    }
    if (component.readOnly) {
      console.log('component.readOnly', component.readOnly);
    }
    let control = new FormControl(value, validators);
    //@ts-ignore
    control.componentType = component.type
    component.readOnly ? control.disable() : undefined
    return control
  }

  cloneAbstractControl<T extends AbstractControl>(control: T): T {

    let newControl: T;

    if (control instanceof FormGroup) {
      const formGroup = new FormGroup({}, control.validator);
      const controls = control.controls;

      Object.keys(controls).forEach(key => {
        formGroup.addControl(key, this.cloneAbstractControl(controls[key]));
      });
      newControl = formGroup as any;

    } else if (control instanceof FormArray) {
      const formArray = new FormArray([], control.validator);
      control.controls.forEach(formControl => formArray.push(this.cloneAbstractControl(formControl)));
      newControl = formArray as any;

    } else if (control instanceof FormControl) {
      newControl = new FormControl(control.value, control.validator) as any;

    } else {
      throw new Error('Error: unexpected control value');
    }

    if (control.disabled) newControl.disable({ emitEvent: false });


    return newControl;
  }

}
