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
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';
import { tableJson } from '@app/editor/utils/section-templates/form-io-json/citableTableJSON';
import { catchError } from 'rxjs/operators';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { YdocService } from '@app/editor/services/ydoc.service';
import { Subject } from 'rxjs';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '@app/shared/material.module';
import { FormControlNameDirective } from '@app/editor/directives/form-control-name.directive';
import { schema } from '@app/editor/utils/Schema';
import { DOMParser } from 'prosemirror-model';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { citationElementMap } from '@app/editor/services/citable-elements.service';
import { TableSizePickerComponent } from '@app/editor/utils/table-size-picker/table-size-picker.component';


let tablesHtmlTemplate = `
<block-table [attr.viewed_by_citat]="data.viewed_by_citat||''" [attr.table_number]="data.tableNumber" [attr.table_id]="data.tableID">
  <h3 tagname="h3" contenteditablenode="false"><p contenteditablenode="false">Table: {{data.tableNumber+1}}</p></h3>
  <table-header-container>
    <table-description *ngIf="data.tableHeader" formControlName="tableHeader" style="display:block;">
    </table-description>
  </table-header-container>
  <table-content *ngIf="data.tableContent" formControlName="tableContent">
  </table-content>
  <table-footer-container>
    <table-description *ngIf="data.tableFooter" formControlName="tableFooter" style="display:block;">
    </table-description>
  </table-footer-container>
</block-table>

`
@Component({
  selector: 'app-add-table-dialog',
  templateUrl: './add-table-dialog.component.html',
  styleUrls: ['./add-table-dialog.component.scss']
})
export class AddTableDialogComponent implements AfterViewInit,AfterViewChecked {
  renderForm = false;
  hidehtml = true;
  sectionContent = JSON.parse(JSON.stringify(tableJson));
  codemirrorHTMLEditor?: EditorView
  @ViewChild('codemirrorHtmlTemplate', { read: ElementRef }) codemirrorHtmlTemplate?: ElementRef;
  @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;
  tablesTemplatesObj: any

  section = { mode: 'editMode' }
  sectionForm = new FormGroup({})
  tableID?: string
  constructor(
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog,
    private compiler: Compiler,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddTableDialogComponent>,
    private ydocService: YdocService,
    @Inject(MAT_DIALOG_DATA) public data: { table: citableTable | undefined, updateOnSave: boolean, index: number, tableID: string | undefined }
  ) {

  }

  ngAfterViewInit(): void {
    try {
      let tableInitioalFormIOJSON = this.ydocService.tablesMap.get('tablesInitialFormIOJson')
      if(tableInitioalFormIOJSON){
        this.sectionContent = JSON.parse(JSON.stringify(tableInitioalFormIOJSON));
      }
      this.tableID = this.data.tableID || uuidv4();
      if (!this.data.table) {
        let rows, cols;
        const tableSizePickerDialog = this.dialog.open(TableSizePickerComponent, {
          width: '284px',
          disableClose: true,
          data: { rows: rows, cols: cols }
        });

        tableSizePickerDialog.afterClosed().subscribe(result => {
          const { rows, cols } = result;
          let tableData = ``;
          for (let i = 0; i < rows; i++) {
            let colums = ``;
            for (let j = 0; j < cols; j++) {
              colums = colums + `
              <td>
                <form-field>
                  <p>
                  </p>
                </form-field>
              </td>
              `
            }
            tableData = tableData + `<tr>${colums}</tr>`
          }
          this.sectionContent.components[1].defaultValue = `
            <table-container>
              <table>
                <tbody>
                  ${tableData}
                </tbody>
              </table>
            </table-container>
            `

          this.renderForm = true
        });
      } else {
        //@ts-ignore
        this.sectionContent.components[0].defaultValue = this.data.table.header
        this.sectionContent.components[1].defaultValue = this.data.table.content;
        this.sectionContent.components[2].defaultValue = this.data.table.footer;
        this.renderForm = true
      }
      this.renderCodemMirrorEditors(this.tableID!)
    } catch (e) {
      console.error(e);
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
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

  submitTable(){
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

      submision.data.tableID = this.tableID!

      submision.data.viewed_by_citat = this.data.tableID ? this.data.table?.viewed_by_citat! : "endEditor"
      this.tablesTemplatesObj[this.tableID!] = { html: prosemirrorNewNodeContent }
      this.ydocService.tablesMap?.set('tablesTemplates', this.tablesTemplatesObj)

      submision.data.tableNumber = this.data.index
      let interpolated: any

      let tableFormGroup = citationElementMap.table_citation.buildElementFormGroup(submision.data)

      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, tableFormGroup);
      let templ = document.createElement('div')
      templ.innerHTML = interpolated
      let Slice = DOMParser.fromSchema(schema).parse(templ.firstChild!)
      let newTable: citableTable = {
        tableNumber: this.data.index,
        content: submision.data.tableContent,
        header: submision.data.tableHeader,
        footer: submision.data.tableFooter,
        "tableID": submision.data.tableID,
        "tablePlace": this.data.tableID ? this.data.table?.tablePlace! : "endEditor",
        "viewed_by_citat": this.data.tableID ? this.data.table?.viewed_by_citat! : "endEditor",
      }
      /* if (this.data.updateOnSave) {
          this.tablesControllerService.updateSingleTable(newTable, this.data.index)
      } */
      //@ts-ignore
      this.dialogRef.close({ table: newTable, tableNode: Slice.content.content[0] })
    } catch (error) {
      console.error(error);
    }
  }

  renderCodemMirrorEditors(tableID: string) {
    try {
      this.tablesTemplatesObj = this.ydocService.tablesMap?.get('tablesTemplates');
      let initialTableTemplate = this.ydocService.tablesMap!.get('tablesInitialTemplate');
      let currFigTemplates
      if (!this.tablesTemplatesObj[tableID]) {
        this.tablesTemplatesObj[tableID] = { html: initialTableTemplate?initialTableTemplate:tablesHtmlTemplate }
        currFigTemplates = this.tablesTemplatesObj[tableID]
      } else {
        currFigTemplates = this.tablesTemplatesObj[tableID]
      }
      //this.ydocService.tablesMap?.set('tablesTemplates',tablesTemplatesObj)
      let prosemirrorNodesHtml = currFigTemplates.html

      //prosemirrorNodesHtml = this.formatHTML(prosemirrorNodesHtml)
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
