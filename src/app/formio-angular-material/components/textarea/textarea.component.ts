import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MaterialComponent } from '../MaterialComponent';
//@ts-ignore
import TextAreaComponent from 'formiojs/components/textarea/TextArea.js';
import isNil from 'lodash/isNil';
import { FormControl, Validators } from '@angular/forms';
import { DOMSerializer, DOMParser } from 'prosemirror-model';
import { schema } from 'src/app/editor/utils/Schema';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ProsemirrorEditorsService } from 'src/app/editor/services/prosemirror-editors.service';
import { YdocService } from 'src/app/editor/services/ydoc.service';
//@ts-ignore
import Validator from 'formiojs/validator/Validator.js';

@Component({
  selector: 'mat-formio-textarea',
  styleUrls: ['./textarea.component.scss'],
  template: `
  <div class="prosemirror-textarea-wrapper">
    <div #ProsemirrorEditor></div>
  </div>
  <textarea [ngStyle]="{'display':'none'}" #textarea></textarea>
  <mat-error class="pm-errors" >
    <div *ngIf="instance.error">
      {{ instance.error.message }}
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


  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;

  constructor(
    private prosemirrorService: ProsemirrorEditorsService,
    private ydocService: YdocService,
    public element: ElementRef,


    public ref: ChangeDetectorRef) {
    super(element, ref)
  }

  onChange1 = (keepInputRaw: boolean, value?: string) => {

    if (value === undefined || value === null) {
      value = this.instance.emptyValue;
    }

    if (this.input && this.input.nativeElement.mask && value && !keepInputRaw) {
      this.input.nativeElement.mask.textMaskInputElement.update(value);
      this.control.setValue(this.input.nativeElement.value);
      value = this.getValue();
    }
    this.instance.updateValue(value, { modified: true });

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
    this.instance.updateValue(containerElement.innerHTML, { modified: true });
    return this.control
  }

  getValue() {
    return this.editorContainer?.editorView.state.doc.textContent;
  }

  setValue(value: any) {
    this.control.setValue(value);
  }

  ngAfterViewInit() {
    // Attach the element so the wysiwyg will work.
    let awaitValue = () => {
      setTimeout(() => {
        if (this.value !== undefined) {
          renderEditor()
        } else {
          this.value = this.control.value

          awaitValue()
        }
      }, 100);
    }
    this.value = this.control.value
    awaitValue()
    let renderEditor = () => {
      try {
        this.render(this.value!)
      } catch (e) {
        console.error(e);
      }
    }
  }

  validateOnInit() {
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
    try {
      //let node = editorData?[schema.nodeFromJSON(editorData)]:[];
      let options: any = {}
      if (this.instance.component.properties.noLabel) {
        options.noLabel = true
      }
      options.onChange = this.onChange1
      let temp = document.createElement('div');
      temp.innerHTML = editorData;
      let node = editorData ? this.DOMPMParser.parseSlice(temp) : undefined;
      this.editorContainer = this.prosemirrorService.renderEditorWithNoSync(this.ProsemirrorEditor?.nativeElement, this.instance, this.control, options, node);
      let nodelNodesString = temp.innerHTML.replace(/<span class="deletion"[\sa-zA-Z-="1-90:;]+>[\sa-zA-Z-="1-90:;]+<\/span>/gm,'');
      temp.innerHTML = nodelNodesString
      this.onChange1(true, temp.textContent!)
      this.renderEditor = true;
    } catch (e) {
      console.error(e);
    }
  }
}
TextAreaComponent.MaterialComponent = MaterialTextareaComponent;
export { TextAreaComponent };
