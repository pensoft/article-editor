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
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { YdocService } from '@app/editor/services/ydoc.service';
import { schema } from '@app/editor/utils/Schema';
import { DOMParser } from 'prosemirror-model';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { FormioEventsService } from '@app/editor/formioComponents/formio-events.service';
import { citationElementMap } from '@app/editor/services/citable-elements.service';
import { TableSizePickerComponent } from '@app/editor/utils/table-size-picker/table-size-picker.component';
import { supplementaryFileJSON } from '@app/editor/utils/section-templates/form-io-json/supplementaryFileFormIOJson';
import { supplementaryFile } from '@app/editor/utils/interfaces/supplementaryFile';


let supplementaryFileHtmlTemplate = `
<block-supplementary-file [attr.supplementary_file_number]="data.supplementary_file_number" [attr.supplementary_file_id]="data.supplementary_file_ID">
<supplementary-file-title style="display: inline;" *ngIf="data.supplementaryFileTitle">
<h3 style="display: inline;" tagname="h3" contenteditablenode="false" >
<p style="display: inline;">
Suppl. material {{data.supplementary_file_number+1}}:&nbsp;
</p>
</h3>
<h3 style="display: inline;" tagname="h3" contenteditablenode="false" >
<p style="display: inline;" formControlName="supplementaryFileTitle">
</p>
</h3>
</supplementary-file-title>
  <supplementary-file-authors *ngIf="data.supplementaryFileAuthors">
    <p style="display: inline;">
      Authors:&nbsp;
    </p>
    <p style="display: inline;" formControlName="supplementaryFileAuthors">
    </p>
  </supplementary-file-authors>
  <supplementary-file-data-type *ngIf="data.supplementaryFileDataType">
    <p style="display: inline;">
      Data type:&nbsp;
    </p>
    <p style="display: inline;" formControlName="supplementaryFileDataType">
    </p>
  </supplementary-file-data-type>
  <supplementary-file-brief-description *ngIf="data.supplementaryFileBriefDescription">
    <p style="display: inline;">
      Brief description:&nbsp;
    </p>
    <form-field style="display: inline;" formControlName="supplementaryFileBriefDescription">
    </form-field>
  </supplementary-file-brief-description>
  <supplementary-file-url *ngIf="data.supplementaryFileURL">
    <p>
      <a href="{{data.supplementaryFileURL}}" onclick="event.preventDefault()">Download file.</a>
    </p>
  </supplementary-file-url>
</block-supplementary-file>
`
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
  @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;
  supplementaryFilesTemplatesObj: any

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
    private formioEventsService: FormioEventsService,
    @Inject(MAT_DIALOG_DATA) public data:  { supplementaryFile:supplementaryFile, updateOnSave: boolean, index: number, supplementaryFileID: string }
  ) {

  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    let supplementaryFilesInitialFormIOJson = this.ydocService.supplementaryFilesMap!.get('supplementaryFilesInitialFormIOJson');
    if(supplementaryFilesInitialFormIOJson){
      console.log('using supplementary file formio json from config',supplementaryFilesInitialFormIOJson);
      this.sectionContent = JSON.parse(JSON.stringify(supplementaryFilesInitialFormIOJson));
    }
    try {
      this.supplementaryFileID = this.data.supplementaryFileID || uuidv4();
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
        this.sectionContent.components[4].defaultValue = urlContainer.textContent;
        this.renderForm = true
      }else{
        this.renderForm = true
      }
      this.renderCodemMirrorEditors(this.supplementaryFileID!)
    } catch (e) {
      console.error(e);
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
        if(supplementaryFilesInitialTemplate){
          console.log('using supplementary file html template from config',supplementaryFilesInitialTemplate);
        }
        this.supplementaryFilesTemplatesObj[supplementaryFileID] = { html: supplementaryFilesInitialTemplate?supplementaryFilesInitialTemplate:supplementaryFileHtmlTemplate }
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
