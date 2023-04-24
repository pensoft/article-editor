import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Compiler,
  Component,
  ElementRef,
  Inject,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { YdocService } from '@app/editor/services/ydoc.service';
import { schema } from '@app/editor/utils/Schema';
import { DOMParser } from 'prosemirror-model';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { citationElementMap } from '@app/editor/services/citable-elements.service';
import { supplementaryFileJSON } from '@app/editor/utils/section-templates/form-io-json/supplementaryFileFormIOJson';
import { supplementaryFile } from '@app/editor/utils/interfaces/supplementaryFile';
import { filterFieldsValues } from '@app/editor/utils/fieldsMenusAndScemasFns';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AppConfig, APP_CONFIG } from '@app/core/services/app-config';


@Component({
  selector: 'app-add-supplementary-file',
  templateUrl: './add-supplementary-file.component.html',
  styleUrls: ['./add-supplementary-file.component.scss']
})
export class AddSupplementaryFileComponent implements AfterViewInit,AfterViewChecked {
  renderForm = false;
  hidehtml = true;
  sectionContent = JSON.parse(JSON.stringify(supplementaryFileJSON));
  codemirrorHTMLEditor?: EditorView
  @ViewChild('codemirrorHtmlTemplate', { read: ElementRef }) codemirrorHtmlTemplate?: ElementRef;
  supplementaryFilesTemplatesObj: any
  fileLinkControl = new FormControl('',Validators.required);

  section = { mode: 'editMode' }
  sectionForm = new FormGroup({})
  supplementaryFileID?: string

  constructor(
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog,
    private compiler: Compiler,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddSupplementaryFileComponent>,
    private ydocService: YdocService,
    private serviceShare: ServiceShare,
    @Inject(APP_CONFIG) readonly config: AppConfig,
    @Inject(MAT_DIALOG_DATA) public data:  { supplementaryFile:supplementaryFile, updateOnSave: boolean, index: number, supplementaryFileID: string }
  ) {

  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  fileType = null

  fileIsUploaded(uploaded){
    if(uploaded.collection&&uploaded.base_url){
      this.uploadedFileInCDN(uploaded)
    }
  }
  uploadedFileInCDN(fileData:any){
    this.fileLinkControl.setValue(fileData.base_url);
  }

  ngAfterViewInit(): void {
    let supplementaryFilesInitialFormIOJson = this.ydocService.supplementaryFilesMap!.get('supplementaryFilesInitialFormIOJson');
    if(supplementaryFilesInitialFormIOJson){
      this.sectionContent = JSON.parse(JSON.stringify(supplementaryFilesInitialFormIOJson));
    }
    try {
      this.supplementaryFileID = this.data.supplementaryFileID || uuidv4();
      this.sectionContent.props = {isCitableElement:true}
      this.serviceShare.FormBuilderService.setAutoFocusInSchema(this.sectionContent);

      let supplementaryFileHTML = this.renderCodemMirrorEditors(this.supplementaryFileID!)
      if (this.data.supplementaryFile) {
        let titleContainer = document.createElement('div');
        titleContainer.innerHTML = this.data.supplementaryFile.title;
        let authorsContainer = document.createElement('div');
        authorsContainer.innerHTML = this.data.supplementaryFile.authors;
        let dataTypeContainer = document.createElement('div');
        dataTypeContainer.innerHTML = this.data.supplementaryFile.data_type;
        let urlContainer = document.createElement('div');
        urlContainer.innerHTML = this.data.supplementaryFile.url;
        this.sectionContent.components[0].defaultValue = titleContainer.textContent;
        this.sectionContent.components[1].defaultValue = authorsContainer.textContent;
        this.sectionContent.components[2].defaultValue = dataTypeContainer.textContent;
        this.sectionContent.components[3].defaultValue = this.data.supplementaryFile.brief_description;
        this.fileLinkControl.setValue(urlContainer.textContent)
        let submision = {data:citationElementMap.supplementary_file_citation.getElFormIOSubmission(this.data.supplementaryFile,'endEditor')}
        filterFieldsValues(this.sectionContent,submision,this.serviceShare,undefined,false,supplementaryFileHTML,false)
        let filterdTableData ={
          "brief_description":submision.data.supplementaryFileBriefDescription,
        }
        titleContainer.innerHTML = submision.data.title;
        authorsContainer.innerHTML = submision.data.authors;
        dataTypeContainer.innerHTML = submision.data.data_type;
        urlContainer.innerHTML = submision.data.url;
        this.sectionContent.components[3].defaultValue = filterdTableData.brief_description;
        this.renderForm = true
      }else{
        this.renderForm = true
      }
    } catch (e) {
      console.error(e);
    }
  }

  isValid:boolean = true;
  formIoSubmission:any
  formIoRoot:any
  onChange(change: any) {
    if(change instanceof Event){

    }else{
      this.isValid
      this.formIoSubmission = change.data
      if(change.changed&&change.changed.instance){
        this.formIoRoot = change.changed.instance.root
      }
    }
  }

  submitSupplementaryFile(){
    if(this.formIoRoot){
      this.formIoRoot.submit()
    }
  }

  async onSubmit(submision?: any) {
    try {
      let escapeHTMLInSubmission = (obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] == 'string') {
            obj[key] = obj[key].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
          } else {
            try {
              escapeHTMLInSubmission(obj[key])
            } catch (e) {
              console.error(e);
            }
          }
        })
      }
      //escapeHTMLInSubmission(submision);
      let tr = this.codemirrorHTMLEditor?.state.update()
      this.codemirrorHTMLEditor?.dispatch(tr!);

      let prosemirrorNewNodeContent = this.codemirrorHTMLEditor?.state.doc.sliceString(0, this.codemirrorHTMLEditor?.state.doc.length);
      submision.data.supplementaryFileURL = this.fileLinkControl.value
      submision.data.supplementary_file_ID = this.supplementaryFileID!

      this.supplementaryFilesTemplatesObj[this.supplementaryFileID] = { html: prosemirrorNewNodeContent }
      this.ydocService.supplementaryFilesMap?.set('supplementaryFilesTemplates', this.supplementaryFilesTemplatesObj)

      submision.data.supplementary_file_number = this.data.index
      let interpolated: any

      let supplementaryFileFormGroup = citationElementMap.supplementary_file_citation.buildElementFormGroup(submision.data)

      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, supplementaryFileFormGroup);
      let templ = document.createElement('div')
      templ.innerHTML = interpolated
      let Slice = DOMParser.fromSchema(schema).parse(templ.firstChild!)
      let newSupplementaryFile:supplementaryFile  ={
        "title":submision.data.supplementaryFileTitle,
        "authors":submision.data.supplementaryFileAuthors,
        "data_type":submision.data.supplementaryFileDataType,
        "brief_description":submision.data.supplementaryFileBriefDescription,
        "supplementary_file_number":this.data.index,
        "supplementary_file_ID":submision.data.supplementary_file_ID,
        "url":submision.data.supplementaryFileURL
      }
      /* if (this.data.updateOnSave) {
          this.tablesControllerService.updateSingleTable(newTable, this.data.index)
      } */
      //@ts-ignore
      let result = { supplementaryFile: newSupplementaryFile, supplementaryFileNode: Slice.content.content[0] }
      this.dialogRef.close(result)
    } catch (error) {
      console.error(error);
    }
  }

  renderCodemMirrorEditors(supplementaryFileID: string) {
    try {
      this.supplementaryFilesTemplatesObj = this.ydocService.supplementaryFilesMap?.get('supplementaryFilesTemplates');
      let supplementaryFilesInitialTemplate = this.ydocService.supplementaryFilesMap!.get('supplementaryFilesInitialTemplate');

      let currSupplementalFileTemplates
      if (!this.supplementaryFilesTemplatesObj[supplementaryFileID]) {
        this.supplementaryFilesTemplatesObj[supplementaryFileID] = { html: supplementaryFilesInitialTemplate }
        currSupplementalFileTemplates = this.supplementaryFilesTemplatesObj[supplementaryFileID]
      } else {
        currSupplementalFileTemplates = this.supplementaryFilesTemplatesObj[supplementaryFileID]
      }
      let prosemirrorNodesHtml = currSupplementalFileTemplates.html

      this.codemirrorHTMLEditor = new EditorView({
        state: EditorState.create({
          doc: prosemirrorNodesHtml,
          extensions: [basicSetup, html()],
        }),
        parent: this.codemirrorHtmlTemplate?.nativeElement,
      })
      return prosemirrorNodesHtml
    } catch (e) {
      console.error(e);
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


}
