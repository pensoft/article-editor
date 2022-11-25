import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { CommentsService } from '@app/editor/utils/commentsService/comments.service';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CitableElementsService } from '@app/editor/services/citable-elements.service';

@Component({
  selector: 'app-insert-table',
  templateUrl: './insert-table.component.html',
  styleUrls: ['./insert-table.component.scss']
})
export class InsertTableComponent implements AfterViewInit {

  error: boolean = false
  tablesData?: string[]
  tables: { [key: string]: citableTable }
  selectedTables: boolean[] = []
  citats: any

  constructor(
    private ydocService: YdocService,
    private dialogRef: MatDialogRef<InsertTableComponent>,
    private commentsPlugin: CommentsService,
    private citableElementsService:CitableElementsService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    @Inject(MAT_DIALOG_DATA) public data: { view: EditorView, citatData: any,sectionID:string }
  ) {
    this.tablesData = this.ydocService.tablesMap?.get('ArticleTablesNumbers')
    this.tables = this.ydocService.tablesMap?.get('ArticleTables')
    this.citats = this.ydocService.citableElementsMap?.get('elementsCitations')
    Object.keys(this.tables).forEach((tableID, i) => {
      this.selectedTables[i] = false;
    })
  }

  getCharValue(i: number) {
    return String.fromCharCode(97 + i)
  }

  setSelection(checked: boolean, tableId: string, tableIndex: number) {
    this.selectedTables[tableIndex] = checked
  }

  ngAfterViewInit(): void {
    /* {
    "citated_tables": [
        "323c824e-e592-4e21-ad1f-48cc67270e1e"
    ],
    "citateid": "e24a2820-1b4d-49ec-aeae-e3c19edf1cf1",
    "last_time_updated": 1639133486636,
    "tables_display_view": [
        "323c824e-e592-4e21-ad1f-48cc67270e1e"
    ],
    "controlPath": "",
    "formControlName": "",
    "contenteditableNode": "false",
    "menuType": "",
    "commentable": "",
    "invalid": "false",
    "styling": ""
} */
    try {
      if(this.data.citatData){
        //@ts-ignore
        let sectionID
        if(this.data.view){
          sectionID = this.commentsPlugin.commentPluginKey.getState(this.data.view.state).sectionName
        }else if(this.data.sectionID){
          sectionID = this.data.sectionID
        }
        //let sectionID = pluginData.sectionName
        let citat = this.citats[sectionID][this.data.citatData.citateid];
        (citat.citedElementsIDs as string[]).forEach((table)=>{
          let tblId = table;
          let index = this.tablesData?.indexOf(tblId)
          this.selectedTables[index!] = true
        })
      }
    } catch (error) {
      console.error(error);
    }
  }

  citateTables() {
    try {
      if (this.selectedTables.length == 0) {
        this.error = true
        setTimeout(() => {
          this.error = false
        }, 3000)
      } else {
        let sectionID
        if(this.data.view){
          sectionID = this.commentsPlugin.commentPluginKey.getState(this.data.view.state).sectionName;
        }else if(this.data.sectionID){
          sectionID = this.data.sectionID;
        }
        this.citableElementsService.citateTables(this.selectedTables, sectionID,this.data.citatData);
        this.dialogRef.close()
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  cancel() {
    this.dialogRef.close()
  }
}
