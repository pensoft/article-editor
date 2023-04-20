import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { CommentsService } from '@app/editor/utils/commentsService/comments.service';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { CitableElementsService } from '@app/editor/services/citable-elements.service';
import { AddSupplementaryFileComponent } from '../add-supplementary-file/add-supplementary-file.component';
import { supplementaryFile } from '@app/editor/utils/interfaces/supplementaryFile';

@Component({
  selector: 'app-insert-supplementary-file',
  templateUrl: './insert-supplementary-file.component.html',
  styleUrls: ['./insert-supplementary-file.component.scss']
})
export class InsertSupplementaryFileComponent implements AfterViewInit {

  error: boolean = false
  supplementaryFilesNumbers?: string[]
  supplementaryFiles: { [key: string]: supplementaryFile }
  selectedSupplementaryFiles: boolean[] = []
  selected = [];
  citats: any

  constructor(
    private ydocService: YdocService,
    private dialogRef: MatDialogRef<InsertSupplementaryFileComponent>,
    private commentsPlugin: CommentsService,
    private citableElementsService:CitableElementsService,
    public dialog: MatDialog,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    @Inject(MAT_DIALOG_DATA) public data: { view: EditorView, citatData: any,sectionID:string, isEdit: boolean }
  ) {
    this.supplementaryFilesNumbers = this.ydocService.supplementaryFilesMap?.get('supplementaryFilesNumbers')
    this.supplementaryFiles = this.ydocService.supplementaryFilesMap?.get('supplementaryFiles')
    this.citats = this.ydocService.citableElementsMap?.get('elementsCitations')
    Object.keys(this.supplementaryFiles).forEach((supplementaryFileId, i) => {
      this.selectedSupplementaryFiles[i] = false;
      if(this.data.citatData?.citated_elements.includes(supplementaryFileId)) {
        this.selected.push(supplementaryFileId);
      }
    })
  }

  getCharValue(i: number) {
    return String.fromCharCode(97 + i)
  }

  setSelection(checked: boolean, supplementaryFileID: string, supplementaryFileIndex: number) {
    if(checked) {
      this.selected.push(supplementaryFileID);
    } else {
      this.selected =  this.selected.filter(id => id !== supplementaryFileID);
    }
    this.selectedSupplementaryFiles[supplementaryFileIndex] = checked
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
        (citat.citedElementsIDs as string[]).forEach((supplementaryFile)=>{
          let tblId = supplementaryFile;
          let index = this.supplementaryFilesNumbers?.indexOf(tblId)
          this.selectedSupplementaryFiles[index!] = true
        })
      }
    } catch (error) {
      console.error(error);
    }
  }

  addSupplementaryFile() {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddSupplementaryFileComponent, {
      //width: '100%',
      // height: '90%',
      data: { supplementaryFile: undefined, updateOnSave: false, index: this.supplementaryFilesNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { supplementaryFile: supplementaryFile, supplementaryFileNode: Node }) => {
      if (result && result.supplementaryFile && result.supplementaryFileNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true);
        this.supplementaryFilesNumbers?.push(result.supplementaryFile.supplementary_file_ID)
        this.supplementaryFiles![result.supplementaryFile.supplementary_file_ID] = result.supplementaryFile
        this.selectedSupplementaryFiles[this.supplementaryFilesNumbers?.length-1] = true;
        this.selected.push(result.supplementaryFile.supplementary_file_ID);
        this.citableElementsService.writeElementDataGlobal(this.supplementaryFiles!, this.supplementaryFilesNumbers!,'supplementary_file_citation');
      }
    })
  }

  citateSupplementaryFiles() {
    try {
      if (this.selectedSupplementaryFiles.length == 0) {
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
        this.citableElementsService.citateSupplementaryFile(this.selectedSupplementaryFiles, sectionID,this.data.citatData);
        this.dialogRef.close({isEdit: this.data.isEdit});
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
