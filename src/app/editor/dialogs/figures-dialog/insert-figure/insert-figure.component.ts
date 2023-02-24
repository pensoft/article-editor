import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CitableElementsService } from '@app/editor/services/citable-elements.service';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { CommentsService } from '@app/editor/utils/commentsService/comments.service';
import { figure } from '@app/editor/utils/interfaces/figureComponent';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { AddFigureDialogV2Component } from '../add-figure-dialog-v2/add-figure-dialog-v2.component';

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

@Component({
  selector: 'app-insert-figure',
  templateUrl: './insert-figure.component.html',
  styleUrls: ['./insert-figure.component.scss']
})
export class InsertFigureComponent implements AfterViewInit {

  error: boolean = false
  figuresData?: string[]
  figures: { [key: string]: figure }
  selectedFigures: boolean[] = []
  figuresComponentsChecked: { [key: string]: boolean[] } = {}
  citats: any

  constructor(
    private ydocService: YdocService,
    private dialogRef: MatDialogRef<InsertFigureComponent>,
    private citableElementsService:CitableElementsService,
    private commentsPlugin: CommentsService,
    public dialog: MatDialog,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    @Inject(MAT_DIALOG_DATA) public data: { view: EditorView, citatData: any,sectionID:string }
  ) {
    this.figuresData = this.ydocService.figuresMap?.get('ArticleFiguresNumbers')
    this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
    this.citats = this.ydocService.citableElementsMap?.get('elementsCitations')
    Object.keys(this.figures).forEach((figID, i) => {
      this.figuresComponentsChecked[figID] = this.figures[figID].components.map(c => false);
      this.selectedFigures[i] = false;
    })
  }

  getCharValue(i: number) {
    return String.fromCharCode(97 + i)
  }

  addFigure(){
    this.dialog.open(AddFigureDialogV2Component, {
      data: { fig: undefined, updateOnSave: false, index: this.figuresData?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure }) => {
      if (result && result.figure ) {
        this.figuresData?.push(result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.selectedFigures[this.figuresData?.length-1] = true
        this.figuresComponentsChecked[result.figure.figureID] = this.figures[result.figure.figureID].components.map(c => true);
        this.citableElementsService.writeElementDataGlobal(this.figures!, this.figuresData, 'citation');
      }
    })
  }

  setSelection(checked: boolean, figureId: string, figIndex: number, figComponentIndex?: number) {
    if (typeof figComponentIndex == 'number') {
      this.figuresComponentsChecked[figureId][figComponentIndex] = checked
      this.selectedFigures[figIndex] = this.figuresComponentsChecked[figureId].filter(e => e).length > 0
    } else {
      this.figuresComponentsChecked[figureId] = this.figuresComponentsChecked[figureId].map(el => checked)
      this.selectedFigures[figIndex] = checked
    }
  }

  ngAfterViewInit(): void {
    /* {
    "citated_figures": [
        "323c824e-e592-4e21-ad1f-48cc67270e1e"
    ],
    "citateid": "e24a2820-1b4d-49ec-aeae-e3c19edf1cf1",
    "last_time_updated": 1639133486636,
    "figures_display_view": [
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
        (citat.citedElementsIDs as string[]).forEach((figure)=>{
          if(figure.includes('|')){
            let splitData = figure.split('|');
            let figId = splitData[0];
            let figCompId = splitData[1];
            this.figuresComponentsChecked[figId][+figCompId] = true
            let index = this.figuresData?.indexOf(figId)
            this.selectedFigures[index!] = true

          }else{
            let figId = figure;
            let index = this.figuresData?.indexOf(figId)
            this.selectedFigures[index!] = true
            this.figuresComponentsChecked[figId].forEach((el,i)=>{
              this.figuresComponentsChecked[figId][i] = true
            })
          }
        })
      }
    } catch (error) {
      console.error(error);
    }
  }

  citateFigures() {
    try {
      if (this.selectedFigures.length == 0) {
        this.error = true
        setTimeout(() => {
          this.error = false
        }, 3000)
      } else {
        let sectionID
        if(this.data.view){
          sectionID = this.commentsPlugin.commentPluginKey.getState(this.data.view.state).sectionName
        }else if(this.data.sectionID){
          sectionID = this.data.sectionID
        }
        this.citableElementsService.citateFigures(this.selectedFigures, this.figuresComponentsChecked, sectionID,this.data.citatData)
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
