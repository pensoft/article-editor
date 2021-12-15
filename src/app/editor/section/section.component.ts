import {
  AfterViewInit,
  Compiler,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  NO_ERRORS_SCHEMA,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { Subject } from 'rxjs';
import { EditSectionService } from '../dialogs/edit-section-dialog/edit-section.service';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { articleSection, editorData } from '../utils/interfaces/articleSection';
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../../shared/material.module";
import { FormControlNameDirective } from "../directives/form-control-name.directive";
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { FormArrayNameDirective } from "../directives/form-array-name.directive";
import { FormBuilderService } from '../services/form-builder.service';
import { YdocService } from '../services/ydoc.service';
import { YMap } from 'yjs/dist/src/internals';
import { FiguresControllerService } from '../services/figures-controller.service';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements AfterViewInit, OnInit {

  renderForm = false;

  hidehtml = true;
  hidejson = true;
  error = false;
  errorMessage = '';
  newValue?: { contentData: editorData, sectionData: articleSection };
  value?: string;
  codemirrorHTMLEditor?: EditorView
  codemirrorJsonEditor?: EditorView
  editorData?: editorData;
  FormStructure: any
  renderSection = false;
  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  _sectionForm!: FormGroup;
  sectionFormClone!: FormGroup;
  @Input() set sectionForm(val) {
    this._sectionForm = val;
    this.sectionFormClone = this.formBuilderService.cloneAbstractControl(this._sectionForm);
  }
  get sectionForm() { return this._sectionForm; }
  @Input() sectionContent: any;


  @ViewChild('codemirrorHtmlTemplate', { read: ElementRef }) codemirrorHtmlTemplate?: ElementRef;
  @ViewChild('codemirrorJsonTemplate', { read: ElementRef }) codemirrorJsonTemplate?: ElementRef;
  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;
  @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;
  @ViewChild('formio', { read: ViewContainerRef }) formio?: ViewContainerRef;

  constructor(
    private compiler: Compiler,
    private editSectionService: EditSectionService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private treeService: TreeService,
    private ydocService: YdocService,
    private formBuilderService: FormBuilderService,
    private figuresControllerService : FiguresControllerService) {

    /* if(this.formControlService.popUpSectionConteiners[this.section.sectionID]){
      this.popUpContainer = this.formControlService.popUpSectionConteiners[this.section.sectionID]
    }else{
      this.formControlService.popUpSectionConteiners[this.section.sectionID] = document.createElement('div');
      this.popUpContainer = this.formControlService.popUpSectionConteiners[this.section.sectionID]
    } */
  }

  ngOnInit() {
  }

  onChange(data: any) {
  }

  ready(form: any) {
    this.FormStructure = form
  }

  isValidHTML(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/xml');
    if (doc.documentElement.querySelector('parsererror')) {
      return doc.documentElement.querySelector('parsererror')!;
    } else {
      return true;
    }
  }

  async onSubmit(submision?: any) {
    try {
      //this.prosemirrorEditorsService.updateFormIoDefaultValues(this.section.sectionID, submision.data)
      this.ydocService.sectionFormGroupsStructures!.set(this.section.sectionID, { data: submision.data, updatedFrom: this.ydocService.ydoc?.guid })
      this.formBuilderService.populateDefaultValues(submision.data, this.section.formIOSchema,this.section.sectionID);
      //this.sectionForm = new FormGroup({});
      Object.keys(this.sectionForm.controls).forEach((key) => {
        this.sectionForm.removeControl(key);
      })
      this.formBuilderService.buildFormGroupFromSchema(this.sectionForm, this.section.formIOSchema);
      //this.treeService.sectionFormGroups[this.section.sectionID] = this.sectionForm;
      //this.sectionForm = nodeForm;
      this.sectionForm.patchValue(submision.data);
      this.sectionForm.updateValueAndValidity()

      let interpolated: any
      let prosemirrorNewNodeContent: any
      this.error = false;
      this.errorMessage = '';
      // get the text content from the codemirror editor which after compiling will be used as the new node structure for sections's Prosemirror

      let tr = this.codemirrorHTMLEditor?.state.update()
      this.codemirrorHTMLEditor?.dispatch(tr!);
      prosemirrorNewNodeContent = this.codemirrorHTMLEditor?.state.doc.sliceString(0, this.codemirrorHTMLEditor?.state.doc.length);
      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, this.sectionForm);
      submision.compiledHtml = interpolated
      this.editSectionService.editChangeSubject.next(submision);
      this.treeService.updateNodeProsemirrorHtml(prosemirrorNewNodeContent, this.section.sectionID)
      this.figuresControllerService.markCitatsViews(this.ydocService.figuresMap?.get('articleCitatsObj'));
      
    } catch (err: any) {
      this.error = true;
      this.errorMessage += 'An error occurred while interpolating the template.\n';
      this.errorMessage += err.message;
      console.error(new Error('An error occurred while interpolating the template.'));
      console.error(err.message);
      return
    }
  }

  formatHTML(html: string) {
    var tab = '\t';
    var result = '';
    var indent = '';

    html.split(/>\s*</).forEach(function (element) {
      if (element.match(/^\/\w/)) {
        indent = indent.substring(tab.length);
      }

      result += indent + '<' + element + '>\r\n';

      if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input")) {
        indent += tab;
      }
    });

    return result.substring(1, result.length - 3);
  }


  renderCodemMirrorEditors() {
    try {
      this.codemirrorJsonEditor = new EditorView({
        state: EditorState.create({
          doc:
            `${JSON.stringify(this.sectionContent, null, "\t")}`,
          extensions: [basicSetup, javascript()],
        }),

        parent: this.codemirrorJsonTemplate?.nativeElement,
        /* dispatch:()=>{

        }, */
      })
      if (!this.section.prosemirrorHTMLNodesTempl) {
        console.error(`prosemirrorHTMLNodesTempl is ${this.section.prosemirrorHTMLNodesTempl}.Should provide such a property in the article sections structure.`)
        return
      }
      let prosemirrorNodesHtml = this.section.prosemirrorHTMLNodesTempl
      /* if (this.prosemirrorEditorsService.editorContainers[this.section.sectionID]) {
        prosemirrorNodesHtml = this.prosemirrorEditorsService.editorContainers[this.section.sectionID].editorView.dom.parentElement?.innerHTML;
      }*/
      prosemirrorNodesHtml = this.formatHTML(prosemirrorNodesHtml)
      this.codemirrorHTMLEditor = new EditorView({
        state: EditorState.create({
          doc: prosemirrorNodesHtml,
          extensions: [basicSetup, html()],

        }),

        parent: this.codemirrorHtmlTemplate?.nativeElement,
      })
    } catch (e) {
      console.error(e);
    }
  }



  ngAfterViewInit(): void {
    // const newSchema = this.populateDefaultValues(this.sectionForm.getRawValue(), this.section.formIOSchema);
    this.sectionContent = this.section.formIOSchema;
    this.renderSection = true

    if (this.section.mode == 'documentMode' && this.section.active) {
      try {
        this.prosemirrorEditorsService.renderEditorInWithId(this.ProsemirrorEditor?.nativeElement, this.section.sectionID, this.section)
      } catch (e) {
        console.error(e);
      }
      return
    }
    try {
      this.renderCodemMirrorEditors();
    } catch (e) {
      console.error(e);
    }

    this.renderForm = true
  }

  log() {
  }
}
