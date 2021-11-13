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
import { html } from '@codemirror/lang-html';
import {Subject} from 'rxjs';
import {EditSectionService} from '../dialogs/edit-section-dialog/edit-section.service';
import {ProsemirrorEditorsService} from '../services/prosemirror-editors.service';
import {articleSection, editorData} from '../utils/interfaces/articleSection';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../shared/material.module";
import {FormControlNameDirective} from "../directives/form-control-name.directive";
import {TreeService} from '../meta-data-tree/tree-service/tree.service';
import {FormArrayNameDirective} from "../directives/form-array-name.directive";
import { FormBuilderService } from '../services/form-builder.service';
import { YdocService } from '../services/ydoc.service';
import { YMap } from 'yjs/dist/src/internals';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements AfterViewInit, OnInit {

  renderForm = false;

  hide = true;
  error = false;
  errorMessage = '';
  newValue?: { contentData: editorData, sectionData: articleSection };
  value?: string;
  codemirrorEditor?: EditorView
  renderEditor = false;
  editorData?: editorData;
  FormStructure: any
  renderSection = false;
  sectionsFromIODefaultValues ?: YMap<any>
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

  
  @ViewChild('codemirror', {read: ElementRef}) codemirror?: ElementRef;
  @ViewChild('ProsemirrorEditor', {read: ElementRef}) ProsemirrorEditor?: ElementRef;
  @ViewChild('container', {read: ViewContainerRef}) container?: ViewContainerRef;
  @ViewChild('formio', {read: ViewContainerRef}) formio?: ViewContainerRef;

  constructor(
    private compiler: Compiler,
    private editSectionService: EditSectionService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private treeService: TreeService,
    private ydocService : YdocService,
    private formBuilderService: FormBuilderService) {

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

  isValidHTML(html:string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/xml');
    if (doc.documentElement.querySelector('parsererror')) {
      return doc.documentElement.querySelector('parsererror')!;
    } else {
      return true;
    }
  }

  async onSubmit(submision?: any) {
    this.sectionsFromIODefaultValues!.set(this.section.sectionID,submision.data)

    this.formBuilderService.populateDefaultValues(submision.data,this.section.formIOSchema);
    let nodeForm: FormGroup = new FormGroup({});
    Object.keys(this.sectionForm.controls).forEach((key)=>{
      this.sectionForm.removeControl(key);
    })
    this.formBuilderService.buildFormGroupFromSchema(this.sectionForm, this.section.formIOSchema);

    //this.sectionForm = nodeForm;
    this.sectionForm.patchValue(submision.data);
    this.sectionForm.updateValueAndValidity()
    
    let interpolated: any
    let prosemirrorNewNodeContent: any
    this.error = false;
    this.errorMessage = '';
    try {
      // get the text content from the codemirror editor which after compiling will be used as the new node structure for sections's Prosemirror
      
      let tr = this.codemirrorEditor?.state.update()
      this.codemirrorEditor?.dispatch(tr!);
      prosemirrorNewNodeContent = this.codemirrorEditor?.state.doc.sliceString(0, this.codemirrorEditor?.state.doc.length);
      //console.log(this.isValidHTML(prosemirrorNewNodeContent));
      interpolated = await this.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, this.sectionForm);
      submision.compiledHtml = interpolated
      this.editSectionService.editChangeSubject.next(submision);
      this.treeService.updateNodeProsemirrorHtml(prosemirrorNewNodeContent, this.section.sectionID)
    } catch (err: any) {
      this.error = true;
      this.errorMessage += 'An error occurred while interpolating the template.\n';
      this.errorMessage += err.message;
      console.log('An error occurred while interpolating the template.');
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


  renderCodemMirrorEditor() {
    if (!this.section.prosemirrorHTMLNodesTempl) {
      console.error(`prosemirrorHTMLNodesTempl is ${this.section.prosemirrorHTMLNodesTempl}.Should provide such a property in the article sections structure.`)
      return
    }
    let prosemirrorNodesHtml = this.section.prosemirrorHTMLNodesTempl
    /* if (this.prosemirrorEditorsService.editorContainers[this.section.sectionID]) {
      prosemirrorNodesHtml = this.prosemirrorEditorsService.editorContainers[this.section.sectionID].editorView.dom.parentElement?.innerHTML;
    }*/
    prosemirrorNodesHtml = this.formatHTML(prosemirrorNodesHtml)
    this.codemirrorEditor = new EditorView({
      state: EditorState.create({
        doc: prosemirrorNodesHtml,
        extensions: [basicSetup,html()],
        
      }),
      
      parent: this.codemirror?.nativeElement,
      /* dispatch: (tr) => {
        this.editor?.update([tr]);
      } */
    })
    this.renderEditor = true;
  }



  ngAfterViewInit(): void {
    this.sectionsFromIODefaultValues = this.ydocService.sectionsFromIODefaultValues
    // const newSchema = this.populateDefaultValues(this.sectionForm.getRawValue(), this.section.formIOSchema);
    this.sectionContent = this.section.formIOSchema;
    this.renderSection = true

    if (this.section.mode == 'documentMode' && this.section.active) {
      try {
        this.prosemirrorEditorsService.renderEditorInWithId(this.ProsemirrorEditor?.nativeElement, this.section.sectionID, this.section)
      } catch (e) {
        console.log(e);
      }
      return
    }
    try {
      this.renderCodemMirrorEditor();
    } catch (e) {
      console.log(e);
    }

    this.renderForm = true
  }

  log() {
    console.log(this.sectionContent);
    console.log(this.formio);
  }

  interpolateTemplate(htmlToCompile: string, data: any, formGroup: FormGroup) {
    let compiler = this.compiler
    let container = this.container
    function getRenderedHtml(templateString: string) {
      return new Promise(resolve => {
        let html = {template:templateString}
        compiler.clearCache();
        let afterViewInitSubject = new Subject()
        // let regExp = new RegExp(">[^<>{{]*<*b*r*>*[^<>{{]*{{[^.}}]*.([^}}]*)}}[^<]*", "g");
        // let matchs = templateString.match(regExp);
        // matchs?.forEach((match) => {
        //   let regexGroups = regExp.exec(match);
        //   let formControlName = regexGroups![1];
        //   templateString = templateString.replace(match, ` formControlName="${formControlName}"` + match)
        // })
        const component = Component({
          ...html,
          styles: [':host {table: {border: red}}'],

        })(class implements AfterViewInit {
          data = data;
          formGroup = formGroup;

          ngAfterViewInit() {
            afterViewInitSubject.next('build')
          }
        });

        const module = NgModule({
          imports: [
            BrowserModule,
            FormsModule,
            ReactiveFormsModule,
            MaterialModule
          ],
          declarations: [component,
            FormControlNameDirective
            ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        })(class newModule {
        });

        compiler.compileModuleAndAllComponentsAsync(module)
          .then(factories => {
            const componentFactory = factories.componentFactories[0];
            const componentRef = container!.createComponent(componentFactory);
            let sub = afterViewInitSubject.subscribe(() => {
              sub.unsubscribe()
              let clearString = componentRef.location.nativeElement.innerHTML
              resolve(clearString)
            })
          });
      })
    }

    return getRenderedHtml(`<ng-container [formGroup]="formGroup">
    <div contenteditable="true" translate="no" class="ProseMirror ProseMirror-example-setup-style ProseMirror-focused">${htmlToCompile}
    </div></ng-container>`)
  }

  
}
