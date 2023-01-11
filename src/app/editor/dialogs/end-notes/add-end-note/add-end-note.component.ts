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
import { citationElementMap } from '@app/editor/services/citable-elements.service';
import { endNoteJSON } from '@app/editor/utils/section-templates/form-io-json/endNoteFormIOJSON';
import { endNote } from '@app/editor/utils/interfaces/endNotes';


let endNoteHtmlTemplate = `
<block-end-note [attr.end_note_number]="data.end_note_number" [attr.end_note_id]="data.end_note_ID">
  <end-note *ngIf="data.endNote">
    <p style="display: inline;" contenteditablenode="false">
      <strong><sup>
        *{{data.end_note_number+1}}&nbsp;&nbsp;&nbsp;&nbsp;
      </sup></strong>
    </p>
    <form-field style="display: inline;" formControlName="endNote">
    </form-field>
  </end-note>
</block-end-note>
`
@Component({
  selector: 'app-add-end-note',
  templateUrl: './add-end-note.component.html',
  styleUrls: ['./add-end-note.component.scss']
})
export class AddEndNoteComponent implements AfterViewInit,AfterViewChecked {
  renderForm = false;
  hidehtml = true;
  sectionContent = JSON.parse(JSON.stringify(endNoteJSON));
  codemirrorHTMLEditor?: EditorView
  @ViewChild('codemirrorHtmlTemplate', { read: ElementRef }) codemirrorHtmlTemplate?: ElementRef;
  @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;
  endNotesTemplatesObj: any

  section = { mode: 'editMode' }
  sectionForm = new FormGroup({})
  endNoteID?: string

  constructor(
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog,
    private compiler: Compiler,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddEndNoteComponent>,
    private ydocService: YdocService,
    @Inject(MAT_DIALOG_DATA) public data:  { endNote:endNote, updateOnSave: boolean, index: number, endNoteID: string }
  ) {

  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    try {
      let endNotesInitialFormIOJson = this.ydocService.endNotesMap!.get('endNotesInitialFormIOJson');
      if(endNotesInitialFormIOJson){
        this.sectionContent = JSON.parse(JSON.stringify(endNotesInitialFormIOJson))
      }
      this.endNoteID = this.data.endNoteID || uuidv4();
      if (this.data.endNote) {
        this.sectionContent.components[0].defaultValue = this.data.endNote.end_note;
        this.renderForm = true
      }else{
        this.renderForm = true
      }
      this.renderCodemMirrorEditors(this.endNoteID!)
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

      submision.data.end_note_ID = this.endNoteID!

      this.endNotesTemplatesObj[this.endNoteID] = { html: prosemirrorNewNodeContent }
      this.ydocService.endNotesMap?.set('endNotesTemplates', this.endNotesTemplatesObj)

      submision.data.end_note_number = this.data.index
      let interpolated: any

      let endNoteFormGroup = citationElementMap.end_note_citation.buildElementFormGroup(submision.data)

      interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data, endNoteFormGroup);
      let templ = document.createElement('div')
      templ.innerHTML = interpolated
      let Slice = DOMParser.fromSchema(schema).parse(templ.firstChild!)
      let newEndNote:endNote  ={
        "end_note":submision.data.endNote,
        "end_note_number":this.data.index,
        "end_note_ID":submision.data.end_note_ID,
      }
      //@ts-ignore
      let result = { endNote: newEndNote, endNoteNode: Slice.content.content[0] }
      this.dialogRef.close(result)
    } catch (error) {
      console.error(error);
    }
  }

  renderCodemMirrorEditors(endNoteID: string) {
    try {
      this.endNotesTemplatesObj = this.ydocService.endNotesMap?.get('endNotesTemplates');
      let endNotesInitialTemplate = this.ydocService.endNotesMap!.get('endNotesInitialTemplate');

      let currEndNoteTemplate
      if (!this.endNotesTemplatesObj[endNoteID]) {
        this.endNotesTemplatesObj[endNoteID] = { html: endNotesInitialTemplate?endNotesInitialTemplate:endNoteHtmlTemplate }
        currEndNoteTemplate = this.endNotesTemplatesObj[endNoteID]
      } else {
        currEndNoteTemplate = this.endNotesTemplatesObj[endNoteID]
      }
      let prosemirrorNodesHtml = currEndNoteTemplate.html

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
