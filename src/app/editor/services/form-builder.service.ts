import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { articleSection } from '../utils/interfaces/articleSection';
import { pmMaxLength, pmMinLength, pmPattern, pmRequired } from '../utils/pmEditorFormValidators/validators';
import { ServiceShare } from './service-share.service';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

  constructor(private serviceShare: ServiceShare) {
    this.serviceShare.shareSelf('FormBuilderService',this)
  }

  populateDefaultValues(savedForm: any, schema: any, sectionID: string, formGroup?: FormGroup) {
    let attachSectionId = (componentArray: any[]) => {
      componentArray.forEach((component) => {
        if (component["properties"]) {
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
    //component.clearOnHide = false;
    if ( //avoids non-dynamic (non-filled) elements
      type === 'button' || // a button
      type === 'content')  // plain text and not an input field
    { } else if (submission[key]||submission[key]==0) {
      if(typeof submission[key] == 'number'){
        component.defaultValue = `${submission[key]}`;
      }else{
        component.defaultValue = submission[key];
      }
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
      component.columns.forEach((col:any,i:number)=>{
        col.components.forEach((comp:any,j:number)=>{
          //@ts-ignore
          //@ts-ignore
          this.updateValue(comp, /* formGroup?.get(component.key+'.'+i).value */submission, formGroup)
        })
      })
      this.updateValue(component, submission, formGroup)
    } else if (type == "select") {
      this.updateValue(component, submission, formGroup)
    } else if (type == "container") {
      this.updateValue(component, submission, formGroup)
    } else if(type == "radio"){
      this.updateValue(component, submission, formGroup)
    }else if (type == 'panel') {
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

  buildFormGroupFromSchema(formGroup: FormGroup, jsonSchema: any, node?: articleSection) {
    formGroup = formGroup || new FormGroup({});
    if (node&&node.title.editable) {
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
      //let formArray = new FormArray([]);
      for (let i = 0; i < component.columns?.length || 0; i++) {
        //let colFormGroup = new FormGroup({});
        component.columns[i].components?.forEach((subComponent: any) => {
          /* let formControl = this.resolveComponent(colFormGroup, subComponent);
          if (formControl) {
            colFormGroup.addControl(subComponent.key, formControl);
          } */
          this.renderSimpleFromControl(formGroup,subComponent);
        });
        //formArray.push(colFormGroup);
      }
      //formGroup.addControl(component.key, formArray);

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
      //@ts-ignore
      if(!control.componentProps){control.componentProps = {}}
      //@ts-ignore
      control.componentProps.placeholder = component.placeholder
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
      //@ts-ignore
    if(!control.componentProps&&(component.type == 'textfield'||component.type == 'number')){control.componentProps = {};control.componentProps.placeholder = component.placeholder}
      //@ts-ignore

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

export let testingFormIOJSON = {
  "components": [
      {
          "label": "Text Field",
          "tableView": true,
          "key": "textField",
          "type": "textfield",
          "input": true
      },
      {
          "label": "Data Map",
          "tableView": false,
          "customDefaultValue": "value = {\n            \"key\": {\n                \"textField\": \"ееявеяве\",\n                \"dataGrid\": [\n                    {\n                        \"textField\": \"явеяве\"\n                    },\n                    {\n                        \"textField\": \"яве\"\n                    },\n                    {\n                        \"textField\": \"явеееявеяве\"\n                    }\n                ]\n            },\n            \"key1\": {\n                \"textField\": \"явеее12е12е13321123\",\n                \"dataGrid\": [\n                    {\n                        \"textField\": \"дсасдасд\"\n                    }\n                ]\n            }\n        }",
          "key": "dataMap",
          "type": "datamap",
          "input": true,
          "valueComponent": {
              "label": "Container",
              "tableView": false,
              "key": "container1",
              "type": "container",
              "input": true,
              "components": [
                  {
                      "label": "Text Field",
                      "tableView": true,
                      "key": "textField",
                      "type": "textfield",
                      "input": true
                  },
                  {
                      "label": "Data Grid",
                      "reorder": false,
                      "addAnotherPosition": "bottom",
                      "layoutFixed": false,
                      "enableRowGroups": false,
                      "initEmpty": false,
                      "tableView": false,
                      "defaultValue": [
                          {}
                      ],
                      "key": "dataGrid",
                      "type": "datagrid",
                      "input": true,
                      "components": [
                          {
                              "label": "Text Field",
                              "tableView": true,
                              "key": "textField",
                              "type": "textfield",
                              "input": true
                          }
                      ]
                  }
              ]
          }
      },
      {
          "label": "Container",
          "tableView": false,
          "key": "container",
          "type": "container",
          "input": true,
          "components": [
              {
                  "label": "Text Field",
                  "tableView": true,
                  "key": "textField",
                  "type": "textfield",
                  "input": true
              },
              {
                  "label": "Password",
                  "tableView": false,
                  "key": "password",
                  "type": "password",
                  "input": true,
                  "protected": true
              },
              {
                  "label": "Number",
                  "mask": false,
                  "tableView": false,
                  "delimiter": false,
                  "requireDecimal": false,
                  "inputFormat": "plain",
                  "truncateMultipleSpaces": false,
                  "key": "number",
                  "type": "number",
                  "input": true
              },
              {
                  "label": "Radio",
                  "optionsLabelPosition": "right",
                  "inline": false,
                  "tableView": false,
                  "values": [
                      {
                          "label": "w",
                          "value": "w",
                          "shortcut": ""
                      },
                      {
                          "label": "e",
                          "value": "e",
                          "shortcut": ""
                      },
                      {
                          "label": "a",
                          "value": "a",
                          "shortcut": ""
                      },
                      {
                          "label": "q",
                          "value": "q",
                          "shortcut": "E"
                      }
                  ],
                  "key": "radio",
                  "type": "radio",
                  "input": true
              },
              {
                  "label": "Email",
                  "tableView": true,
                  "key": "email",
                  "type": "email",
                  "input": true
              }
          ]
      },
      {
          "label": "Currency",
          "mask": false,
          "spellcheck": true,
          "tableView": false,
          "currency": "USD",
          "inputFormat": "plain",
          "truncateMultipleSpaces": false,
          "key": "currency",
          "type": "currency",
          "input": true,
          "delimiter": true
      },
      {
          "label": "Survey",
          "tableView": false,
          "questions": [
              {
                  "label": "яве",
                  "value": "явее",
                  "tooltip": "еяве"
              },
              {
                  "label": "еее",
                  "value": "еее",
                  "tooltip": ""
              },
              {
                  "label": "вввв",
                  "value": "вввв",
                  "tooltip": ""
              },
              {
                  "label": "яяяя",
                  "value": "яяяя",
                  "tooltip": ""
              }
          ],
          "values": [
              {
                  "label": "яве",
                  "value": "яве",
                  "tooltip": "явеяве"
              },
              {
                  "label": "в",
                  "value": "в",
                  "tooltip": "е"
              },
              {
                  "label": "е",
                  "value": "е",
                  "tooltip": "е"
              },
              {
                  "label": "р",
                  "value": "р",
                  "tooltip": "е"
              },
              {
                  "label": "т",
                  "value": "т",
                  "tooltip": "е"
              },
              {
                  "label": "ъ",
                  "value": "ъ",
                  "tooltip": "е"
              }
          ],
          "key": "survey",
          "type": "survey",
          "input": true
      },
      {
          "label": "Data Grid",
          "reorder": false,
          "addAnotherPosition": "bottom",
          "layoutFixed": false,
          "enableRowGroups": false,
          "initEmpty": false,
          "tableView": false,
          "defaultValue": [
              {}
          ],
          "key": "dataGrid",
          "type": "datagrid",
          "input": true,
          "components": [
              {
                  "label": "Select Boxes",
                  "optionsLabelPosition": "right",
                  "tableView": false,
                  "values": [
                      {
                          "label": "w",
                          "value": "w",
                          "shortcut": ""
                      },
                      {
                          "label": "e",
                          "value": "e",
                          "shortcut": ""
                      },
                      {
                          "label": "q",
                          "value": "q",
                          "shortcut": ""
                      },
                      {
                          "label": "e",
                          "value": "e",
                          "shortcut": ""
                      }
                  ],
                  "key": "selectBoxes",
                  "type": "selectboxes",
                  "input": true,
                  "inputType": "checkbox"
              },
              {
                  "label": "Tags",
                  "tableView": false,
                  "key": "tags",
                  "type": "tags",
                  "input": true,
                  "defaultValue": "w,e,q,r,t,y,s,d,f,g,h,j"
              }
          ]
      },
      {
          "label": "Tree",
          "tableView": false,
          "key": "tree",
          "type": "tree",
          "input": true,
          "tree": true,
          "components": [
              {
                  "label": "Data Grid",
                  "reorder": false,
                  "addAnotherPosition": "bottom",
                  "layoutFixed": false,
                  "enableRowGroups": false,
                  "initEmpty": false,
                  "tableView": false,
                  "defaultValue": [
                      {}
                  ],
                  "key": "dataGrid",
                  "type": "datagrid",
                  "input": true,
                  "components": [
                      {
                          "label": "Text Area",
                          "autoExpand": false,
                          "tableView": true,
                          "key": "textArea",
                          "type": "textarea",
                          "input": true
                      }
                  ]
              }
          ],
          "defaultValue": {
              "data": {
                  "dataGrid": [
                      {
                          "textArea": "123"
                      },
                      {
                          "textArea": "123"
                      },
                      {
                          "textArea": "123"
                      }
                  ]
              },
              "children": [
                  {
                      "data": {
                          "dataGrid": [
                              {
                                  "textArea": "123"
                              },
                              {
                                  "textArea": "123"
                              }
                          ]
                      },
                      "children": [
                          {
                              "data": {
                                  "dataGrid": [
                                      {
                                          "textArea": "123"
                                      }
                                  ]
                              },
                              "children": []
                          },
                          {
                              "data": {
                                  "dataGrid": [
                                      {
                                          "textArea": "123"
                                      }
                                  ]
                              },
                              "children": []
                          }
                      ]
                  },
                  {
                      "data": {
                          "dataGrid": [
                              {
                                  "textArea": "123"
                              }
                          ]
                      },
                      "children": []
                  }
              ]
          }
      },
      {
          "type": "button",
          "label": "Submit",
          "key": "submit",
          "disableOnInvalid": true,
          "input": true,
          "tableView": false
      }
  ]
}
