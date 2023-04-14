import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { figure } from '../../utils/interfaces/figureComponent';
import { Node } from 'prosemirror-model';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AddFigureDialogV2Component } from './add-figure-dialog-v2/add-figure-dialog-v2.component';
import { AskBeforeDeleteComponent } from '../ask-before-delete/ask-before-delete.component';
@Component({
  selector: 'app-figures-dialog',
  templateUrl: './figures-dialog.component.html',
  styleUrls: ['./figures-dialog.component.scss']
})
export class FiguresDialogComponent implements AfterViewInit {

  figuresMap?: YMap<any>
  figuresNumbers?: string[]
  figures?: { [key: string]: figure }
  editedFigures: { [key: string]: boolean } = {}
  deletedFigures: string[] = []

  constructor(
    public ydocService:YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<FiguresDialogComponent>,
    private serviceShare: ServiceShare
  ) {
    let figuresNumbersArray = ydocService.figuresMap!.get('ArticleFiguresNumbers')
    let figures = ydocService.figuresMap!.get('ArticleFigures')
    this.figuresNumbers = JSON.parse(JSON.stringify(figuresNumbersArray))
    this.figures = JSON.parse(JSON.stringify(figures));
  }

  ngAfterViewInit(): void {
    //this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.figuresNumbers!, event.previousIndex, event.currentIndex);
    this.serviceShare.CitableElementsService.writeElementDataGlobal(this.figures!, this.figuresNumbers, 'citation');
  }


  editFigure(fig: figure, figIndex: number){
    this.dialog.open(AddFigureDialogV2Component, {
      data: { fig, updateOnSave: false, index: figIndex, figID: fig.figureID },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure }) => {
      if (result && result.figure ) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true)
        this.figuresNumbers?.splice(figIndex, 1, result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.editedFigures[result.figure.figureID] = true
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.figures!, this.figuresNumbers, 'citation');
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false)
      }
    })
  }

  deleteFigure(fig: figure, figIndex: number) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      data: {type: 'figure', dontshowType:true,objName:'Figure №'+(figIndex+1) },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.figuresNumbers?.splice(figIndex, 1);
        delete this.figures![fig.figureID]
          if (this.editedFigures[fig.figureID]) {
            delete this.editedFigures[fig.figureID]
          }
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.figures!, this.figuresNumbers, 'citation');
      }
    })
  }

  addFigure(){
    this.dialog.open(AddFigureDialogV2Component, {
      data: { fig: undefined, updateOnSave: false, index: this.figuresNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure }) => {
      if (result && result.figure ) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true);
        this.figuresNumbers?.push(result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.figures!, this.figuresNumbers, 'citation');
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false);
      }
    })
  }


  saveFigures() {
    this.dialogRef.close(true)
  }

  cancelFiguresEdit() {
    this.dialogRef.close()
  }
}
