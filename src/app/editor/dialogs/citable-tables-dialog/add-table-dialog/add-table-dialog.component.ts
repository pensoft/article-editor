import {
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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
import { CitableTablesService } from '@app/editor/services/citable-tables.service';
import { schema } from '@app/editor/utils/Schema';
import { DOMParser } from 'prosemirror-model';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { buildTableForm } from '@app/editor/services/citable-tables.service';
import { FormioEventsService } from '@app/editor/formioComponents/formio-events.service';

let tablesHtmlTemplate = `
<block-table [attr.viewed_by_citat]="data.viewed_by_citat||''" [attr.table_number]="data.tableNumber" [attr.table_id]="data.tableID">
  <table-descriptions-container>
    <h3 tagname="h3" contenteditablenode="false">Table: {{data.tableNumber+1}}</h3>
    <table-description *ngIf="data.tableDescription" formControlName="tableDescription" style="display:block;">
    </table-description>
  </table-descriptions-container>
  <table-content *ngIf="data.tableComponents" formControlName="tableComponents">
  </table-content>
  <spacer></spacer>
</block-table>

`
@Component({
  selector: 'app-add-table-dialog',
  templateUrl: './add-table-dialog.component.html',
  styleUrls: ['./add-table-dialog.component.scss']
})
export class AddTableDialogComponent implements AfterViewInit {
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
    private compiler: Compiler,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddTableDialogComponent>,
    private citableTablesService : CitableTablesService,
    private ydocService: YdocService,
    private formioEventsService: FormioEventsService,
    @Inject(MAT_DIALOG_DATA) public data: { table: citableTable | undefined, updateOnSave: boolean, index: number, tableID: string | undefined }
  ) {

  }

  ngAfterViewInit(): void {
    try {
      this.tableID = this.data.tableID || uuidv4();
      if (!this.data.table) {
        this.renderForm = true
      } else {
        //@ts-ignore
        this.sectionContent.components[0].defaultValue = this.data.table.description
        this.sectionContent.components[1].defaultValue = this.data.table.components;
        this.renderForm = true
      }
      this.renderCodemMirrorEditors(this.tableID!)
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

      submision.data.tableID = this.tableID!

      submision.data.viewed_by_citat = this.data.tableID ? this.data.table?.viewed_by_citat! : "endEditor"
      this.tablesTemplatesObj[this.tableID!] = { html: prosemirrorNewNodeContent }
      this.ydocService.tablesMap?.set('tablesTemplates', this.tablesTemplatesObj)

      submision.data.tableNumber = this.data.index
      let interpolated: any


      let tableFormGroup = buildTableForm(submision.data)

      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data,tableFormGroup);
      let templ = document.createElement('div')
      templ.innerHTML = interpolated
      let Slice = DOMParser.fromSchema(schema).parse(templ.firstChild!)
      let newTable: citableTable = {
        tableNumber: this.data.index,
        description: submision.data.tableDescription,
        components: submision.data.tableComponents,
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
      this.tablesTemplatesObj = this.ydocService.tablesMap?.get('tablesTemplates')
      let currFigTemplates
      if (!this.tablesTemplatesObj[tableID]) {
        this.tablesTemplatesObj[tableID] = { html: tablesHtmlTemplate }
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
