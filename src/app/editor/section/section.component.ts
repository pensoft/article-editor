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
import {BrowserModule} from '@angular/platform-browser';
import {basicSetup, EditorState, EditorView} from '@codemirror/basic-setup';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {Subject} from 'rxjs';
import {EditSectionService} from '../dialogs/edit-section-dialog/edit-section.service';
import {ProsemirrorEditorsService} from '../services/prosemirror-editors.service';
import {articleSection, editorData} from '../utils/interfaces/articleSection';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../shared/material.module";
import {FormControlNameDirective} from "../directives/form-control-name.directive";
import {TreeService} from '../meta-data-tree/tree-service/tree.service';
import {FormArrayNameDirective} from "../directives/form-array-name.directive";
import {FormBuilderService} from '../services/form-builder.service';
import {YdocService} from '../services/ydoc.service';
import {YMap} from 'yjs/dist/src/internals';
import {FiguresControllerService} from '../services/figures-controller.service';
import {DetectFocusService} from '../utils/detectFocusPlugin/detect-focus.service';
//@ts-ignore
import {updateYFragment} from '../../y-prosemirror-src/plugins/sync-plugin.js';
import {DOMParser as DOMParserPM} from 'prosemirror-model';
import {schema} from '../utils/Schema';
import {HelperService} from "@app/editor/section/helpers/helper.service";

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

  childrenTreeCopy?: articleSection[]
  complexSection = false;
  complexSectionDeletedChildren: articleSection[] = []
  complexSectionAddedChildren: articleSection[] = []

  @Input() component!: any;
  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  _sectionForm!: FormGroup;
  sectionFormClone!: FormGroup;

  @Input() set sectionForm(val) {
    this._sectionForm = val;
    this.sectionFormClone = this.formBuilderService.cloneAbstractControl(this._sectionForm);
  }

  get sectionForm() {
    return this._sectionForm;
  }

  @Input() sectionContent: any;


  @ViewChild('codemirrorHtmlTemplate', {read: ElementRef}) codemirrorHtmlTemplate?: ElementRef;
  @ViewChild('codemirrorJsonTemplate', {read: ElementRef}) codemirrorJsonTemplate?: ElementRef;
  @ViewChild('ProsemirrorEditor', {read: ElementRef}) ProsemirrorEditor?: ElementRef;
  @ViewChild('container', {read: ViewContainerRef}) container?: ViewContainerRef;
  @ViewChild('formio', {read: ViewContainerRef}) formio?: ViewContainerRef;

  constructor(
    private compiler: Compiler,
    private editSectionService: EditSectionService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private treeService: TreeService,
    private ydocService: YdocService,
    private formBuilderService: FormBuilderService,
    public detectFocusService: DetectFocusService,
    public helperService: HelperService,
    private figuresControllerService: FiguresControllerService) {

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

  cancelComplexSectionEdit() {
    //this.editSectionService.editChangeSubject.next();
  }

  submitComplexSectionEdit() {
    this.treeService.buildNewFormGroupsChange(this.complexSectionAddedChildren);
    this.treeService.replaceChildrenChange(this.childrenTreeCopy!, this.section);
    this.complexSectionDeletedChildren.forEach((section) => {
    })
    //this.editSectionService.editChangeSubject.next();
  }

  onSubmit = async (submision?: any) => {
    try {
      if (this.section.type == 'complex') {
        this.submitComplexSectionEdit()
      }

      //this.prosemirrorEditorsService.updateFormIoDefaultValues(this.section.sectionID, submision.data)
      this.ydocService.sectionFormGroupsStructures!.set(this.section.sectionID, {
        data: submision.data,
        updatedFrom: this.ydocService.ydoc?.guid
      })
      this.formBuilderService.populateDefaultValues(submision.data, this.section.formIOSchema, this.section.sectionID, this.sectionForm);
      //this.sectionForm = new FormGroup({});
      Object.keys(this.sectionForm.controls).forEach((key) => {
        this.sectionForm.removeControl(key);
      })
      this.formBuilderService.buildFormGroupFromSchema(this.sectionForm, this.section.formIOSchema, this.section);
      this.treeService.setTitleListener(this.section)
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
      this.treeService.updateNodeProsemirrorHtml(prosemirrorNewNodeContent, this.section.sectionID)
      let figuresMap = this.ydocService.figuresMap!;
      this.figuresControllerService.markCitatsViews(figuresMap.get('articleCitatsObj'));
      this.editSectionService.editChangeSubject.next(submision);

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

  async initialRender() {
    //this.ydocService.sectionFormGroupsStructures!.set(this.section.sectionID, { data: submision.data, updatedFrom: this.ydocService.ydoc?.guid })
    //this.formBuilderService.populateDefaultValues(submision.data, this.section.formIOSchema, this.section.sectionID,this.sectionForm);
    if (this.treeService.sectionFormGroups[this.section.sectionID]) {
      this.sectionForm = this.treeService.sectionFormGroups[this.section.sectionID]
      Object.keys(this.sectionForm.controls).forEach((key) => {
        this.sectionForm.removeControl(key);
      })
    } else {
      this.treeService.sectionFormGroups[this.section.sectionID] = new FormGroup({});
      this.sectionForm = this.treeService.sectionFormGroups[this.section.sectionID]
    }
    this.formBuilderService.buildFormGroupFromSchema(this.sectionForm, this.section.formIOSchema, this.section);
    this.treeService.setTitleListener(this.section)
    //this.sectionForm.updateValueAndValidity()
    let submision: any = {}
    let interpolated: any
    let prosemirrorNewNodeContent: any
    this.error = false;
    this.errorMessage = '';
    // get the text content from the codemirror editor which after compiling will be used as the new node structure for sections's Prosemirror
    let tr = this.codemirrorHTMLEditor?.state.update()
    this.codemirrorHTMLEditor?.dispatch(tr!);
    prosemirrorNewNodeContent = this.section.prosemirrorHTMLNodesTempl;
    const root = this.helperService.filter(this.treeService.articleSectionsStructure, this.section.sectionID);
    if (root.prosemirrorHTMLNodesTempl.indexOf(`<ng-template #${this.section.title.name.replace(/[\W_]+/g,'')}`) > -1) {
      prosemirrorNewNodeContent = root.prosemirrorHTMLNodesTempl;
      if (this.section.title.name === 'Material') {
        interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, this.section.defaultFormIOValues, this.sectionForm, this.section.title.name.replace(/[\W_]+/g,''));
      } else {
        debugger
        interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, {}, this.sectionForm, this.section.title.name.replace(/[\W_]+/g,''));
      }
    } else {
      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, {}, this.sectionForm);
    }
    submision.compiledHtml = interpolated
    this.treeService.updateNodeProsemirrorHtml(prosemirrorNewNodeContent, this.section.sectionID)
    //this.editSectionService.editChangeSubject.next(submision);
    //this.treeService.editNodeChange(this.section.sectionID)

    //let copyOriginUpdatesBeforeReplace = [...originUpdates]
    //let trackStatus = this.prosemirrorEditorsService.trackChangesMeta.trackTransactions
    this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = false
    this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
      this.prosemirrorEditorsService.trackChangesMeta
    )
    let xmlFragment = this.ydocService.ydoc.getXmlFragment(this.section.sectionID);
    let templDiv = document.createElement('div');
    templDiv.innerHTML = submision.compiledHtml
    let node1 = DOMParserPM.fromSchema(schema).parse(templDiv.firstChild!);

    updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
    this.prosemirrorEditorsService.renderEditorInWithId(this.ProsemirrorEditor?.nativeElement, this.section.sectionID, this.section)


  }

  ngAfterViewInit(): void {
    // const newSchema = this.populateDefaultValues(this.sectionForm.getRawValue(), this.section.formIOSchema);
    this.sectionContent = this.section.formIOSchema;
    this.renderSection = true
    if (this.section.mode == 'documentMode' && this.section.active) {
      if (this.section.initialRender == this.ydocService.ydoc.guid) {
        this.section.initialRender = undefined;
        this.initialRender()
        return
      } else {
        this.section.initialRender = undefined;
        try {
          this.prosemirrorEditorsService.renderEditorInWithId(this.ProsemirrorEditor?.nativeElement, this.section.sectionID, this.section)
        } catch (e) {
          console.error(e);
        }
        return
      }
    }
    if (this.section.type == 'complex') {
      this.renderComplexSectionTree()
    }
    try {
      this.renderCodemMirrorEditors();
    } catch (e) {
      console.error(e);
    }

    let editorContainer = this.prosemirrorEditorsService.editorContainers[this.section.sectionID]
    if (editorContainer) {
      let editorView = editorContainer.editorView

      editorView.focus()
      editorView.dispatch(editorView.state.tr.scrollIntoView())
      this.detectFocusService.sectionName = this.section.sectionID

    }

    //chanking if the JSON has a submit btn and if it does not add one

    if (!(this.sectionContent.components as Array<any>).find((val) => {
      return (val.key == 'submit' && val.type == 'button')
    })) {
      this.sectionContent.components.push({
        "type": "button",
        "label": "Submit",
        "key": "submit",
        "disableOnInvalid": true,
        "input": true,
        "tableView": false,
        "properties": {
          "sectionID": this.section.sectionID
        }
      })
    }

    this.renderForm = true
  }

  renderComplexSectionTree() {
    this.complexSection = true;
    this.childrenTreeCopy = JSON.parse(JSON.stringify(this.section.children))
  }

  log() {
  }
}
