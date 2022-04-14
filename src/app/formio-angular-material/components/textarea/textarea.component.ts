import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import TextAreaComponent from 'formiojs/components/textarea/TextArea.js';
import isNil from 'lodash/isNil';
import { FormControl, Validators } from '@angular/forms';
import { DOMSerializer, DOMParser, Schema, Fragment } from 'prosemirror-model';
import { schema } from 'src/app/editor/utils/Schema';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ProsemirrorEditorsService } from 'src/app/editor/services/prosemirror-editors.service';
import { YdocService } from 'src/app/editor/services/ydoc.service';
//@ts-ignore
import Validator from 'formiojs/validator/Validator.js';
import { ClientRequest } from 'http';

@Component({
  selector: 'mat-formio-textarea',
  styleUrls: ['./textarea.component.scss'],
  template: `
  <div class="prosemirror-textarea-wrapper">
    <div #ProsemirrorEditor></div>
  </div>
  <textarea [ngStyle]="{'display':'none'}" #textarea></textarea>
  <mat-error  class="pm-errors" >
    <div *ngIf="validity.length>0">
      {{ validity[0].message  }}
    </div>
  </mat-error>
  <!-- <mat-error class="pm-errors" [ngStyle]="{'display':instance.error?'none':'block'}"]>{{ instance.error.message }}</mat-error> -->
  `
})
export class MaterialTextareaComponent extends MaterialComponent implements AfterViewInit {
  renderEditor = false;
  @ViewChild('textarea') textarea?: ElementRef;

  pmControl?: FormControl;
  pmControl1: FormControl = new FormControl(null, [Validators.required])
  placeholder = 'asd'
  DOMPMSerializer = DOMSerializer.fromSchema(schema);

  editorContainer?: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  };
  DOMPMParser = DOMParser.fromSchema(schema)
  value: any
  instanceValidations: any
  rerender = false;
  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;

  constructor(
    private prosemirrorService: ProsemirrorEditorsService,
    private ydocService: YdocService,
    public element: ElementRef,


    public ref: ChangeDetectorRef) {
    super(element, ref)
    this.editorContainer = undefined;
    //this.renderEditor = true
  }

  setInstance(instance: any) {
    instance.materialComponent = this;
    this.instance = instance;
    this.control.setInstance(instance);
    //this.instance.updateValue(value, { modified: true });
    this.instanceValidations = this.instance.component.validate
    this.instance.component.validate = {}
    this.instance.disabled = this.instance.shouldDisabled;
    /* this.setVisible(this.instance.visible); */
  }

  ngOnInit() {
  }

  onChange(keepInputRaw?: boolean) {
    return
  }
  validity:any[] = []
  onChange1 = (keepInputRaw: boolean, value1?: string) => {
    Validator
    let hasChanges = value1?.match(/<span class="(deletion|insertion|format-change)"/gm);
    if (hasChanges && Object.keys(this.instance.component.validate).length > 2) {
      this.instanceValidations = this.instance.component.validate
      this.instance.component.validate = {}
    } else if (!hasChanges && Object.keys(this.instance.component.validate).length == 2) {
      this.instance.component.validate = this.instanceValidations
    }
    let temp = document.createElement('div');
    temp.innerHTML = value1!
    let value = temp.textContent!

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }

    if (this.input && this.input.nativeElement.mask && value && !keepInputRaw) {
      this.input.nativeElement.mask.textMaskInputElement.update(value);
      this.control.setValue(this.input.nativeElement.value);
      value = this.getValue()!;
    }
    this.instance.updateValue(value, { modified: true });
    let validity = Validator.checkComponent(this.instance,{[this.instance.component.key]:value},{[this.instance.component.key]:value});
    this.validity = validity
    this.instance.setCustomValidity(validity, false);
    this.instance.root.changeVisibility(this.instance);

  }

  beforeSubmit() {
    /* {
    "required": true,
    "pattern": "asd",
    "minLength": 2,
    "maxLength": 10,
    "custom": "",
    "customPrivate": false,
    "strictDateValidation": false,
    "multiple": false,
    "unique": false
    } */
    if (this.instance.component.validate.required) {
      this.instance.component.validate.required = false
    }
    if (this.instance.component.validate.pattern) {
      this.instance.component.validate.pattern = `[\\s\\S.]*`
    }
    if (this.instance.component.validate.minLength) {
      this.instance.component.validate.minLength = undefined
    }
    if (this.instance.component.validate.maxLength) {
      this.instance.component.validate.maxLength = undefined
    }
    this.control.markAsTouched();
    let containerElement = document.createElement('div');
    let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(this.editorContainer?.editorView.state.doc.content.firstChild!.content!)
    containerElement.appendChild(htmlNOdeRepresentation);
    /* if(htmlNOdeRepresentation.textContent == ''&&htmlNOdeRepresentation.childNodes.length==0){
      let placeholder = (this.instance.component.placeholder&&this.instance.component.placeholder!=='')?this.instance.component.placeholder:undefined
      if(placeholder){
        containerElement.innerHTML = `<pm-placeholder>${placeholder}</pm-placeholder>`
      }
    } */
    this.instance.updateValue(containerElement.innerHTML, { modified: true });
    this.control.setValue(containerElement.innerHTML);
    return this.control
  }

  getValue() {
    return this.editorContainer?.editorView.state.doc.textContent;
  }

  setValue(value1: any) {
    this.control.setValue(value1);
    return
    let hasChanges = value1?.match(/<span class="(deletion|insertion|format-change)"/gm);
    if (hasChanges && Object.keys(this.instance.component.validate).length > 2) {
      this.instanceValidations = this.instance.component.validate
      this.instance.component.validate = {}
    } else if (!hasChanges && Object.keys(this.instance.component.validate).length == 2) {
      this.instance.component.validate = this.instanceValidations
    }
    let temp = document.createElement('div');
    temp.innerHTML = value1!
    let value = temp.textContent!

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }
    this.control.setValue(value);
    this.instance.updateValue(value, { modified: true });
  }

  setRealValue() {
    this.rerender = true;
    this.instanceValidations = this.instance.component.validate
    this.instance.component.validate = {}
    let containerElement = document.createElement('div'); this.control.markAsTouched();
    let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(this.editorContainer?.editorView.state.doc.content.firstChild!.content!)
    containerElement.appendChild(htmlNOdeRepresentation);
    this.instance.updateValue(containerElement.innerHTML, { modified: true });
    this.control.setValue(containerElement.innerHTML);
  }

  renderComponents() {
    /* this.setVisible(this.instance.visible); */
    if (!this.rerender) {
      return
    }
    try {
      this.value = this.control.value;
      //let node = editorData?[schema.nodeFromJSON(editorData)]:[];
      let options: any = {}
      Object.keys(this.instance.component.properties).forEach((key) => {
        options[key] = this.instance.component.properties[key]
      })
      options.path = this.instance.path
      options.onChange = this.onChange1
      let temp = document.createElement('div');
      temp.innerHTML = this.value!;
      let node = this.value! ? this.DOMPMParser.parseSlice(temp) : undefined;
      this.editorContainer = this.prosemirrorService.renderEditorWithNoSync(this.ProsemirrorEditor?.nativeElement, this.instance, this.control, options, node);
      let containersCount = 0
      let edView = this.editorContainer.editorView;
      edView.state.doc.descendants((el) => {
        if (el.type.name == 'figures_nodes_container') {
          containersCount++;
        }
      })
      let deleted = false;
      let tr1: any
      let del = () => {
        deleted = false
        tr1 = edView.state.tr
        edView.state.doc.descendants((node, position, parent) => {
          if (node.type.name == 'figures_nodes_container' && !deleted) {
            deleted = true
            tr1 = tr1.replaceWith(position, position + node.nodeSize, Fragment.empty).setMeta('shouldTrack', false)
          }
        })
        edView.dispatch(tr1)
      }
      for (let index = 0; index < containersCount; index++) {
        del()
      }
      this.instance.component.validate = this.instanceValidations
      this.onChange1(true,this.value)

      this.renderEditor = true;

    } catch (e) {
      console.error(e);
    }
  }

  ngAfterViewInit() {
    // Attach the element so the wysiwyg will work.
    let awaitValue = () => {
      setTimeout(() => {
        if (this.value) {
          try {
            this.rerender = true
            //this.onChange1(true, this.control.value)
            this.renderComponents()
          } catch (e) {
            console.error(e);
          }
        } else if (!this.rerender) {
          this.value = this.control.value

          awaitValue()
        }
      }, 20);
      setTimeout(() => {
        if (!this.value && !this.rerender) {
          try {
            this.rerender = true
            //this.onChange1(true, this.control.value)
            this.renderComponents()
          } catch (e) {
            console.error(e);
          }
        }
      }, 500)
    }
    this.value = this.control.value
    awaitValue()
    /* let renderEditor = () => {
      try {
        this.render(this.value!)
      } catch (e) {
        console.error(e);
      }
    } */
  }

  validateOnInit() {

    return
    const { key } = this.instance.component;
    const validationValue = this.editorContainer?.editorView.state

    if (validationValue === null) {
      return;
    }

    this.instance.setPristine(false);

    const validationResult = Validator.checkComponent(
      this.instance,
      { [key]: validationValue },
      { [key]: validationValue }
    );

    if (validationResult.length) {
      this.instance.setCustomValidity(validationResult, false);
      if (!!validationValue) {
        this.control.markAsTouched();
      }
      this.ref.detectChanges();
    }
  }



  render(editorData: any) {

  }
}
TextAreaComponent.MaterialComponent = MaterialTextareaComponent;
export { TextAreaComponent };
