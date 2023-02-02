import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { figure } from '../../utils/interfaces/figureComponent';
import { AddFigureDialogComponent } from './add-figure-dialog/add-figure-dialog.component';
import { Node } from 'prosemirror-model';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AddFigureDialogV2Component } from './add-figure-dialog-v2/add-figure-dialog-v2.component';
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
  }

  /* editFigure(fig: figure, figIndex: number) {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddFigureDialogComponent, {
      //width: '100%',
      // height: '90%',
      data: { fig, updateOnSave: false, index: figIndex, figID: fig.figureID },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure }) => {
      if (result && result.figure) {
        console.log(result);

        //this.serviceShare.PmDialogSessionService!.endSubsession(true)
        this.figuresNumbers?.splice(figIndex, 1, result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.editedFigures[result.figure.figureID] = true
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false)
      }
    })
  } */

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
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false)
      }
    })
  }

  deleteFigure(fig: figure, figIndex: number) {
    this.figuresNumbers?.splice(figIndex, 1);
    delete this.figures![fig.figureID]
    if (this.editedFigures[fig.figureID]) {
      delete this.editedFigures[fig.figureID]
    }
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
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false);
      }
    })
  }

  /* addFigure() {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddFigureDialogComponent, {
      //width: '100%',
      // height: '90%',
      data: { fig: undefined, updateOnSave: false, index: this.figuresNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure }) => {
      if (result && result.figure ) {
        console.log(result);
        //this.serviceShare.PmDialogSessionService!.endSubsession(true);
        this.figuresNumbers?.push(result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false);
      }
    })
  } */

  saveFigures() {
    this.serviceShare.CitableElementsService.writeElementDataGlobal(this.figures!, this.figuresNumbers, 'citation');
    this.dialogRef.close(true)
  }

  cancelFiguresEdit() {
    this.dialogRef.close()
  }
}
