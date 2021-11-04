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
import {EditorState, EditorView} from '@codemirror/basic-setup';
import {html} from '@codemirror/lang-html';
import {Subject} from 'rxjs';
import {EditSectionService} from '../dialogs/edit-section-dialog/edit-section.service';
import {ProsemirrorEditorsService} from '../services/prosemirror-editors.service';
import {articleSection, editorData} from '../utils/interfaces/articleSection';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormControlService} from './form-control.service';
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
    private formControlService: FormControlService,
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
    /* let path = data?.changed?.instance?.path;
    let value = data?.changed?.value;


    if(path) {
      path = path.replaceAll('[', '.');
      path = path.replaceAll(']', '');


      // TODO if FormArray
      // if(Array.isArray(value)) {
      //   this.sectionFormClone.get(path)?.setValue(new Array(value.length));
      // }

      this.sectionFormClone.get(path)?.setValue(value);
      this.sectionFormClone.updateValueAndValidity();
    } */
  }

  ready(form: any) {
    this.FormStructure = form
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
    /* Object.keys(this.myForm.controls).forEach((key)=>{
      if(submision.data[key]&&key!=='dataGrid'){
        this.myForm.controls[key].patchValue(submision.data[key])
      }
    })
    if(submision.data.dataGrid!==undefined){
      let dataGridFormArray = this.myForm.controls.dataGrid as FormArray
      let gridFromGroups = dataGridFormArray.controls as FormGroup[]
      (submision.data.dataGrid as any[]).forEach((gridRow:any,i)=>{
        let textFieldValue = gridRow.textField
        let selectValue = gridRow.select
        gridFromGroups[i].controls.textField.patchValue(textFieldValue)
        gridFromGroups[i].controls.select.patchValue(textFieldValue)
      })
    } */
    let interpolated: any
    let prosemirrorNewNodeContent: any
    try {
      this.formControlService.setFormGroupBySectionId(this.section.sectionID, this.sectionForm);
      // get the text content from the codemirror editor which after compiling will be used as the new node structure for sections's Prosemirror
      prosemirrorNewNodeContent = this.codemirrorEditor?.state.doc.sliceString(0, this.codemirrorEditor?.state.doc.length);
      interpolated = await this.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, this.sectionForm);
      submision.compiledHtml = interpolated
      this.editSectionService.editChangeSubject.next(submision);
    } catch (err: any) {
      console.error(err.message);
      return
    }
    this.treeService.updateNodeProsemirrorHtml(prosemirrorNewNodeContent, this.section.sectionID)


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
        extensions: [html()]
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
          template: templateString,
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

  /* renderSection() {
    let t = this.section.title
    let c = this.section.sectionContent
    return [...this.renderFormioComponent(t.type, t.key, t.contentData!), ...this.renderFormioComponent(c.type, c.key, c.contentData!)]
  }

  renderFormioComponent(type: string, key: 'titleContent' | 'sectionContent' | string, contentData: titleContentData | sectionContentData, attr?: any): any {
    let re: any
    if (type == 'editorContentType') {


      re = [{
        type: type,
        key: key,
        input: true,
        'defaultValue': { contentData, sectionData: this.section },
        ...attr
      }]

    } else if (type == 'taxonomicCoverageContentType') {
      re = this.renderTaxonomicComponent(type, key, contentData as taxonomicCoverageContentData)
    } else if (type == 'TaxonTreatmentsMaterial') {
      let cd = contentData as editorData
      if (cd.editorMeta?.formioJson && this.section.mode == 'editMode') {
        re = [
          this.renderContentFormioJson(type, key, contentData)
          //cd.editorMeta?.formioJson
        ]
      } else {
        re = [{
          type: "editorContentType",
          key: key,
          input: true,
          'defaultValue': { contentData, sectionData: this.section },
          ...attr
        }]
      }
    } else {
      re = [{
        type: type,
        key: key,
        input: true,
        'defaultValue': { contentData, sectionData: this.section },
        ...attr
      }]
    }
    return re
  }

  renderContentFormioJson(type: string, key: string, contentData: titleContentData | sectionContentData) {
    if (type == 'TaxonTreatmentsMaterial') {
      //let nodeJsonFormIOStructureObj = this.ydocService.articleStructure?.get(this.section.sectionID+'TaxonTreatmentsMaterial')
      let formIOJson = this.ydocService.articleStructure?.get(this.section.sectionID + 'TaxonTreatmentsMaterialFormIOJson')
      let editorContainer = this.prosemirrorEditorsService.editorContainers[(contentData as editorData).editorId]
      if (!editorContainer) {
        return formIOJson
      }
      let editorDoc = editorContainer.editorView.state.doc
      if (editorDoc.content.size > 1000) {
        return formIOJson
      }
      let inputContainerNodesArray = editorDoc.content.content // content of the first paragrapt in the editor

      let inputsInEditor: any = {

      }

      inputContainerNodesArray.forEach((node: any) => {
        let inputId = node.attrs.inputId;

        let labelNode = node.content.content[0];
        let label = labelNode.attrs.text;

        let placeholderNode = node.content.content[1];
        let placeholder = placeholderNode.content.content[0].text;

        inputsInEditor[inputId] = { placeholder }
        //nodeJsonFormIOStructureObj[inputId].key = inputId+label;
        //nodeJsonFormIOStructureObj[inputId].defaultValue = placeholder;
      })
      //this.ydocService.articleStructure?.set(this.section.sectionID+'TaxonTreatmentsMaterial',nodeJsonFormIOStructureObj)

      let recursiveInputDetect = (components: any[]) => {
        components.forEach((el, index, array) => {
          if (el.input) {
            let keyData = el.key.split('|');
            if (inputsInEditor[keyData[0]]) {
              el.defaultValue = inputsInEditor[keyData[0]].placeholder
            }
          }
          if (el.components) {
            if (el?.components.length > 0) {
              recursiveInputDetect(el.components);
            }
          }
        })
      }
      recursiveInputDetect([formIOJson])
      this.ydocService.articleStructure?.set(this.section.sectionID + 'TaxonTreatmentsMaterialFormIOJson', formIOJson)

      return formIOJson
    }
  }

  renderRow(taxa: taxa, index: number) {
    let selectDefaultValue = taxa.rank.defaulValue ? { 'defaultValue': taxa.rank.defaulValue } : {}
    let rows = [
      {
        "components": [
          ...this.renderFormioComponent("editorContentType", "scientificName", taxa.scietificName, { "tableView": true }),

        ]
      }, {
        "components": [
          ...this.renderFormioComponent("editorContentType", "commonName", taxa.commonName),

        ]
      }, {
        "components": [
          {
            "label": "Rank",
            "widget": "choicesjs",
            "tableView": true,
            "data": {
              "values": taxa.rank.options.reduce<{ "label": string, "value": string }[]>((prev, curr, i, arr) => {
                return prev.concat([{ "label": arr[i], "value": arr[i] }])
              }, []),
            },
            "properties": {
              "tableRowIndex": index,
              "Section": this.section,
              "TaxonomicSection": this.section.sectionContent,
              "type": 'sectionContent'
            },
            "selectThreshold": 0.3,
            "key": `rank${index}`,
            "type": "select",
            "indexeddb": {
              "filter": {}
            },
            "input": true,
            ...selectDefaultValue
          }
        ]
      }
    ]
    return rows
  }
  renderTaxonomicComponent(type: string, key: string, contentData: taxonomicCoverageContentData) {
    let rows: any[] = [];
    contentData.taxaArray.forEach((taxa, index) => {
      rows.push(this.renderRow(taxa, index));
    })
    return [...this.renderFormioComponent('editorContentType', 'description', contentData.description), {
      "label": "Table",
      "cellAlignment": "left",
      "key": "table",
      "type": "table",
      "input": true,
      'defaultValue': { contentData, sectionData: this.section, type: 'sectionContent' },
      "tableView": false,
      "rows": rows,
      "numRows": rows.length,
      "numCols": 3
    }]
  }

  submit(value: any) {
  } */
}
