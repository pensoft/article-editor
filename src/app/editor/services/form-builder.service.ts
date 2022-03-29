import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { addRowBefore } from 'prosemirror-tables';
import { retryWhen } from 'rxjs/operators';
import { articleSection } from '../utils/interfaces/articleSection';
import { pmMaxLength, pmMinLength, pmPattern, pmRequired } from '../utils/pmEditorFormValidators/validators';
import { ServiceShare } from './service-share.service';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

  constructor(private serviceShare: ServiceShare) {

  }

  populateDefaultValues(savedForm: any, schema: any, sectionID: string, formGroup?: FormGroup) {
    let attachSectionId = (componentArray: any[]) => {
      componentArray.forEach((component) => {
        if (component.componentProperties) {
          component["properties"]["sectionID"] = sectionID
        } else {
          component["properties"] = {}
          component["properties"]["sectionID"] = sectionID
        }
        if (component.components && component.components instanceof Array && component.components.length > 0) {
          attachSectionId(component.components)
        }
      })
    }
    if (schema.components && schema.components.length > 0) {
      attachSectionId(schema.components)
    }
    for (let index = 0; index < schema.components.length; index++) {
      const component: any = schema.components[index];
      this.updateDefaultValue(component,savedForm,formGroup)
    }
    return schema;
  }

  updateValue(component: any, submission: any, formGroup?: FormGroup) {
    let key = component.key
    let type = component.type
    if ( //avoids non-dynamic (non-filled) elements
      type === 'button' || // a button
      type === 'content')  // plain text and not an input field
    { } else if (submission[key]) {
      component.defaultValue = submission[key];
      if (formGroup) {
        let form = formGroup!.controls[key]
        //@ts-ignore
        if (form && form.componentProps) {
          //@ts-ignore
          Object.keys(form.componentProps).forEach(key => { component["properties"][key] = form.componentProps[key] });
        }
      }
    }
  }

  updateDefaultValue(component: any, submission: any, formGroup?: FormGroup) {
    let type = component.type
    let key = component.key
    if (type == 'datagrid') {
      this.updateValue(component, submission, formGroup)
    } else if (component.type == 'columns') {
      this.updateValue(component, submission, formGroup)
    } else if (type == "select") {
      this.updateValue(component, submission, formGroup)

    } else if (type == "container") {
      this.updateValue(component, submission, formGroup)

    } else if (type == 'panel') {
      component.components.forEach((subcomp: any) => {
        this.updateDefaultValue(subcomp, submission, formGroup)
      })
    } else if (type == 'table') {
      component.rows.forEach((row: any[]) => {
        row.forEach((cell) => {
          cell.components.forEach((cellSubComp: any) => {
            this.updateDefaultValue(cellSubComp, submission, formGroup)
          })
        })
      })
    } else {
      this.updateValue(component, submission, formGroup)
    }

  }

  labelupdateLocalMeta: any = {}



  buildFormGroupFromSchema(formGroup: FormGroup, jsonSchema: any, node: articleSection) {
    formGroup = formGroup || new FormGroup({});
    if (node.title.editable) {
      let titleFormControl = new FormControl(node.title.label, [Validators.maxLength(34)]);
      formGroup.addControl('sectionTreeTitle', titleFormControl);
      //@ts-ignore
      formGroup.titleUpdateMeta = { time: Date.now() };
    }

    if (!jsonSchema.components) {
      return formGroup;
    }

    jsonSchema.components.forEach((component: any) => {
      this.resolveComponent(formGroup, component);
    });

    return formGroup;
  }

  renderSimpleFromControl(formGroup: FormGroup, component: any) {
    let formControl = this.resolveFormControl(component);
    if (formControl) {
      formGroup.addControl(component.key, formControl);
    }
  }

  resolveComponent(formGroup: FormGroup, component: any) {
    let type = component.type
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

    } else if (component.type == 'container') {
      let containerGroup = new FormGroup({});
      for (let i = 0; i < component.components?.length || 0; i++) {
        let subComponent = component.components[i];
        this.resolveComponent(containerGroup,subComponent);
      }
      formGroup.addControl(component.key, containerGroup);

    } else if (component.type == 'columns') {
      let formArray = new FormArray([]);
      for (let i = 0; i < component.columns?.length || 0; i++) {
        let colFormGroup = new FormGroup({});
        component.columns[i].components?.forEach((subComponent: any) => {
          let formControl = this.resolveComponent(colFormGroup, subComponent);
          if (formControl) {
            colFormGroup.addControl(subComponent.key, formControl);
          }
        });
        formArray.push(colFormGroup);
      }
      formGroup.addControl(component.key, formArray);

    } else if (type == "select") {
      this.renderSimpleFromControl(formGroup, component)
    } else if (type == 'panel') {
      component.components.forEach((subcomp: any) => {
        this.resolveComponent(formGroup, subcomp)
      })
    } else if (type == 'table') {
      //let tableArray = new FormArray([])
      component.rows.forEach((row: any[]) => {
        //let rowFormGroup = new FormArray([]);
        row.forEach((cell) => {
          //let cellFormGroup = new FormGroup({})
          cell.components.forEach((cellSubComp: any) => {
            this.resolveComponent(formGroup, cellSubComp)
          })
          //rowFormGroup.push(cellFormGroup)
        })
        //tableArray.push(rowFormGroup);
      })
      //formGroup.addControl(component.key,tableArray)
    } else {
      this.renderSimpleFromControl(formGroup, component)
    }
    return formGroup;
  }

  resolveFormControl(component: any) {

    if (component.key === 'submit') {
      return null;
    }

    let value = component.defaultValue;
    if (component.type == 'textarea') {
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
