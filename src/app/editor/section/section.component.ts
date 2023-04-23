import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Compiler,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgModule,
  NO_ERRORS_SCHEMA,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {basicSetup, EditorState, EditorView} from '@codemirror/basic-setup';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {EditSectionService} from '../dialogs/edit-section-dialog/edit-section.service';
import {ProsemirrorEditorsService} from '../services/prosemirror-editors.service';
import {articleSection, editorData} from '../utils/interfaces/articleSection';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TreeService} from '../meta-data-tree/tree-service/tree.service';
import {FormBuilderService} from '../services/form-builder.service';
import {YdocService} from '../services/ydoc.service';
import {DetectFocusService} from '../utils/detectFocusPlugin/detect-focus.service';
//@ts-ignore
import {updateYFragment} from '../../y-prosemirror-src/plugins/sync-plugin.js';
import {DOMParser as DOMParserPM} from 'prosemirror-model';
import {HelperService} from "@app/editor/section/helpers/helper.service";
import { ServiceShare } from '../services/service-share.service';
import { filterFieldsValues } from '../utils/fieldsMenusAndScemasFns';
import { schema } from '../utils/Schema';
import { customSecInterface, FunderSectionComponent } from './funder-section/funder-section.component';
import { MaterialSectionComponent } from './material-section/material-section.component';
import { MaterialsSectionComponent } from './materials-section/materials-section.component';
import { TaxonSectionComponent } from './taxon-section/taxon-section.component';
import { Subject } from 'rxjs';
import { AppConfig, APP_CONFIG } from '@app/core/services/app-config';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
})
export class SectionComponent implements AfterViewInit, OnInit ,AfterViewChecked {

  renderForm = false;

  hidehtml = true;
  hidejson = true;
  hideDefsjson = true;
  error = false;
  errorMessage = '';
  newValue?: { contentData: editorData, sectionData: articleSection };
  value?: string;
  codemirrorHTMLEditor?: EditorView
  codemirrorJsonEditor?: EditorView
  codemirrorMenusAndSchemasDefsEditor?: EditorView
  editorData?: editorData;
  FormStructure: any
  renderSection = false;
  sectionTreeTitleValue = ''

  childrenTreeCopy?: articleSection[]
  complexSection = false;
  complexSectionDeletedChildren: articleSection[] = []
  complexSectionAddedChildren: articleSection[] = []

  @Input() component!: any;
  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();
  @Input() editOnAddFromParent?: true;
  @Input() sectionContent: any = undefined;

  _sectionForm!: FormGroup;
  sectionFormClone!: FormGroup;

  @Input() set sectionForm(val) {
    this._sectionForm = val;
    this.sectionFormClone = this.formBuilderService.cloneAbstractControl(this._sectionForm);
  }

  get sectionForm() {
    return this._sectionForm;
  }



  @ViewChild('codemirrorHtmlTemplate', {read: ElementRef}) codemirrorHtmlTemplate?: ElementRef;
  @ViewChild('codemirrorJsonTemplate', {read: ElementRef}) codemirrorJsonTemplate?: ElementRef;
  @ViewChild('codemirrorMenusAndSchemasDefs', {read: ElementRef}) codemirrorMenusAndSchemasDefs?: ElementRef;
  @ViewChild('ProsemirrorEditor', {read: ElementRef}) ProsemirrorEditor?: ElementRef;
  @ViewChild('container', {read: ViewContainerRef}) container?: ViewContainerRef;
  @ViewChild('formio', {read: ViewContainerRef}) formio?: ViewContainerRef;

  triggerCustomSecSubmit = new Subject()

  constructor(
    private compiler: Compiler,
    private editSectionService: EditSectionService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private treeService: TreeService,
    private ydocService: YdocService,
    private formBuilderService: FormBuilderService,
    public detectFocusService: DetectFocusService,
    public helperService: HelperService,
    private serviceShare:ServiceShare,
    private changeDetectionRef:ChangeDetectorRef,
    @Inject(APP_CONFIG) readonly config: AppConfig
    ) {
    /* if(this.formControlService.popUpSectionConteiners[this.section.sectionID]){
      this.popUpContainer = this.formControlService.popUpSectionConteiners[this.section.sectionID]
    }else{
      this.formControlService.popUpSectionConteiners[this.section.sectionID] = document.createElement('div');
      this.popUpContainer = this.formControlService.popUpSectionConteiners[this.section.sectionID]
    } */
  }

  ngAfterViewChecked(): void {
    this.changeDetectionRef.detectChanges()
  }

  ngOnInit() {
  }

  isValid:boolean = true;
  isModified:boolean = false;
  formIoSubmission:any
  formIoRoot:any
  onChange(change: any) {
    if(change instanceof Event){

    }else{
      this.isValid = change.isValid
      this.isModified = change.isModified
      this.formIoSubmission = change.data
      let vals = JSON.parse(JSON.stringify(change.data));
      if((change.changed && change.changed.instance) || this.formIoRoot){
        let rawVals = (change.changed)?change.changed.instance.root.rawVals:this.formIoRoot.rawVals;
        if(rawVals){
          Object.keys(rawVals).forEach((key)=>{
            vals[key] = rawVals[key];
          })
        }
      }
      if(/{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(this.section.title.template)){
        this.serviceShare.ProsemirrorEditorsService?.interpolateTemplate(this.section.title.template, vals, this.sectionForm).then((newTitle: string) => {
          this.sectionTreeTitleValue = newTitle
        })
      }else if(vals.sectionTreeTitle != null && vals.sectionTreeTitle != undefined){
        this.sectionTreeTitleValue = vals.sectionTreeTitle;
      }
      if(change.changed&&change.changed.instance){
        this.formIoRoot = change.changed.instance.root
      }
    }
  }

  submitSection(){
    if(this.formIoRoot){
      this.formIoRoot.submit()
    }else if(this.section.title.name == 'Taxon'||this.section.title.name == '[MM] Materials'||this.section.title.name == 'Material'||this.section.title.name=='[AM] Funder'){
      this.triggerCustomSecSubmit.next(true)
    }
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

  addCustomSectionData(section:articleSection,data:any){
    let customPropsObj = this.ydocService.customSectionProps?.get('customPropsObj');
    customPropsObj[section.sectionID] = data;
    this.ydocService.customSectionProps?.set('customPropsObj',customPropsObj);
  }



  onSubmit = async (submision?: any) => {
    try {

      if(submision.data.sectionTreeTitle) {
        const matched = /<p\b[^>]*>(.*?)<\/p>/.exec(submision.data.sectionTreeTitle);
      
        if(matched) {
          submision.data.sectionTreeTitle = matched[1];
        } 
      }
      let prosemirrorNewNodeContent = this.codemirrorHTMLEditor?.state.doc.sliceString(0, this.codemirrorHTMLEditor?.state.doc.length);
      
      filterFieldsValues(this.sectionContent,submision,this.serviceShare,this.section.sectionID,false,prosemirrorNewNodeContent,false);

      if (this.section.type == 'complex') {
        this.submitComplexSectionEdit()
      }
      if(this.section.title.name == 'Taxon'||this.section.title.name == '[MM] Materials'||this.section.title.name == 'Material'||this.section.title.name=='[AM] Funder'){
        // custum section
        this.addCustomSectionData(this.section,submision.data)
      }
      if(this.section.title.name == '[MM] Materials'||this.section.title.name == 'Material'){
        this.serviceShare.makeFlat()
      }
        //this.prosemirrorEditorsService.updateFormIoDefaultValues(this.section.sectionID, submision.data)
      this.ydocService.sectionFormGroupsStructures!.set(this.section.sectionID, {
        data: submision.data,
        updatedFrom: this.ydocService.ydoc?.guid
      })
      this.formBuilderService.populateDefaultValues(submision.data, this.section.formIOSchema, this.section.sectionID,this.section, this.sectionForm);
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
      this.error = false;
      this.errorMessage = '';
      // get the text content from the codemirror editor which after compiling will be used as the new node structure for sections's Prosemirror
      let tr = this.codemirrorHTMLEditor?.state.update()
      this.codemirrorHTMLEditor?.dispatch(tr!);
      let {nodeLevel, hTag} = this.treeService.getNodeLevel(this.section)
      if (prosemirrorNewNodeContent.indexOf(`<ng-template #${this.section.title.name.replace(/[\W_]+/g,'')}`) > -1) {
        if (this.section.title.name === 'Material') {
          interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, this.sectionForm, this.section.title.name.replace(/[\W_]+/g,''), {hTag});
        } else {
          interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, this.sectionForm, this.section.title.name.replace(/[\W_]+/g,''),{hTag});
        }
      } else {
        interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!,submision.data, this.sectionForm, null, {hTag});
      }

      if(submision.data.sectionTreeTitle && submision.data.sectionTreeTitle.length > 0){
        this.treeService.saveNewTitleChange(this.section, submision.data.sectionTreeTitle);
      }

      submision.compiledHtml = interpolated
      this.prosemirrorEditorsService
      this.treeService.updateNodeProsemirrorHtml(prosemirrorNewNodeContent, this.section.sectionID)
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
    let tab = '\t';
    let result = '';
    let indent = '';

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
      if(!this.config.production) {
        this.codemirrorJsonEditor = new EditorView({
        state: EditorState.create({
          doc:
            `${JSON.stringify(this.sectionContent, null, "\t")}`,
          extensions: [basicSetup, javascript()],
        }),
        parent: this.codemirrorJsonTemplate?.nativeElement,
        })

        let {importantMenusDefsForSection,importantScehmasDefsForSection,menusAndSchemasForCitableElements} = this.prosemirrorEditorsService.getMenusAndSchemaDefsImportantForSection(this.section.sectionID)
       
        this.codemirrorMenusAndSchemasDefsEditor = new EditorView({
          state: EditorState.create({
            doc:
              `${JSON.stringify({importantMenusDefsForSection,importantScehmasDefsForSection}, null, "\t")}`,
            extensions: [basicSetup, javascript()],
          }),
          parent: this.codemirrorMenusAndSchemasDefs?.nativeElement,
        })
      }
      
      if (!this.section.prosemirrorHTMLNodesTempl) {
        console.error(`prosemirrorHTMLNodesTempl is ${this.section.prosemirrorHTMLNodesTempl}.Should provide such a property in the article sections structure.`)
        return
      }

      if (!this.section.prosemirrorHTMLNodesTempl) {
        console.error(`prosemirrorHTMLNodesTempl is ${this.section.prosemirrorHTMLNodesTempl}.Should provide such a property in the article sections structure.`)
        return
      }
      let prosemirrorNodesHtml = this.section.prosemirrorHTMLNodesTempl
      // if (this.prosemirrorEditorsService.editorContainers[this.section.sectionID]) {
      //   prosemirrorNodesHtml = this.prosemirrorEditorsService.editorContainers[this.section.sectionID].editorView.dom.parentElement?.innerHTML;
      // }
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
    if((this.section.title.name == 'Taxon'||this.section.title.name == '[MM] Materials'||this.section.title.name == 'Material')/* &&!this.editOnAddFromParent */){
      // custum section
      this.addCustomSectionData(this.section,this.section.defaultFormIOValues)
    }
    let {nodeLevel, hTag} = this.treeService.getNodeLevel(this.section)
    if (root.prosemirrorHTMLNodesTempl.indexOf(`<ng-template #${this.section.title.name.replace(/[\W_]+/g,'')}`) > -1) {
      prosemirrorNewNodeContent = root.prosemirrorHTMLNodesTempl;
      if (this.section.title.name === 'Material') {
        interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, this.section.defaultFormIOValues, this.sectionForm, this.section.title.name.replace(/[\W_]+/g,''),{hTag});
      } else {
        interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, {}, this.sectionForm, this.section.title.name.replace(/[\W_]+/g,''),{hTag});
      }
    } else {
      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, {}, this.sectionForm, null,{hTag});
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
    let editorSchema = schema
    let node1 = DOMParserPM.fromSchema(editorSchema).parse(templDiv.firstChild!);

    updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
    this.prosemirrorEditorsService.renderEditorInWithId(this.ProsemirrorEditor?.nativeElement, this.section.sectionID, this.section);
  }

  ngAfterViewInit(): void {
    //const newSchema = this.populateDefaultValues(this.sectionForm.getRawValue(), this.section.formIOSchema);

    //let newSchema = this.formBuilderService.populateDefaultValues(this.treeService.sectionFormGroups[this.section.sectionID].getRawValue(), this.section.formIOSchema, this.section.sectionID, this.sectionForm);
    let editorObj;
    //this.sectionContent = newSchema;
    if(!this.sectionForm){
      this.sectionContent = this.formBuilderService.populateDefaultValues(this.treeService.sectionFormGroups[this.section.sectionID].getRawValue(), this.section.formIOSchema, this.section.sectionID,this.section, this.sectionForm);
    }

    this.renderSection = true
    if (this.section.mode == 'documentMode' && this.section.active) {
      if(this.section.type == 'complex') {
        let nodeForm = new FormGroup({});
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, this.sectionContent, this.section);
        this.treeService.sectionFormGroups[this.section.sectionID] = nodeForm;
        this.treeService.setTitleListener(this.section);
      }
      if (this.section.initialRender == this.ydocService.ydoc.guid) {
        this.section.initialRender = undefined;
        this.initialRender()
        return
      } else {
        this.section.initialRender = undefined;
        try {
          editorObj = this.prosemirrorEditorsService.renderEditorInWithId(this.ProsemirrorEditor?.nativeElement, this.section.sectionID, this.section)
        } catch (e) {
          console.error(e);
        }
        if(this.treeService.sectionFormGroups[this.section.sectionID] && this.treeService.sectionFormGroups[this.section.sectionID].controls['content']) {
          this.prosemirrorEditorsService.dispatchEmptyTransaction();
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

    this.sectionTreeTitleValue = this.section.title.label;
    if ((this.sectionContent.components as Array<any>).find((val) => {
      return (val.key == 'submit' && val.type == 'button')
    })) {
      this.sectionContent.components = this.sectionContent.components.filter((val) => {
        return (val.key != 'submit' || val.type != 'button')
      })
    }

    if(this.sectionContent.props){
      this.sectionContent.props.initialSectionTitle = this.section.title.label;
      this.sectionContent.props.isSectionPopup = true;
      this.sectionContent.props.sectionLabelTemplate = this.section.title.template;
    }else{
      this.sectionContent.props = {
        initialSectionTitle:this.section.title.label,
        isSectionPopup:true,
        sectionLabelTemplate:this.section.title.template
      }
    }
    if(this.sectionContent.components.length > 0 && this.sectionContent.components[0].key == 'sectionTreeTitle') {
      this.sectionContent.components[0].defaultValue = '<p controlpath="" customproppath="" formcontrolname="" contenteditablenode="" menutype="" allowedtags="" commentable="" invalid="false" style="" class="set-align-left">' +  this.section.title.label + '</p>';
    }    
    this.renderForm = true
  }

  renderComplexSectionTree() {
    this.complexSection = true;
    this.childrenTreeCopy = JSON.parse(JSON.stringify(this.section.children))
  }
}
