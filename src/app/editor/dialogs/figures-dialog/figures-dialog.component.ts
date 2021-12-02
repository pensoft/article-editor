import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { figure } from '../../utils/interfaces/figureComponent';
import { AddFigureDialogComponent } from './add-figure-dialog/add-figure-dialog.component';

@Component({
  selector: 'app-figures-dialog',
  templateUrl: './figures-dialog.component.html',
  styleUrls: ['./figures-dialog.component.scss']
})
export class FiguresDialogComponent implements AfterViewInit {

  figuresMap ?:YMap<figure[]>
  figures ?: figure[] 
  constructor(
    private ydocService:YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<FiguresDialogComponent>,
    private figuresControllerService:FiguresControllerService
  ) { 
    let figures = ydocService.figuresMap!.get('ArticleFigures')
    figuresControllerService.figuresData = figures
    this.figures = figuresControllerService.figuresData
  }

  ngAfterViewInit(): void {
    //this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.figures!, event.previousIndex, event.currentIndex);
  }

  editFigure(fig:figure,figIndex:number){
    this.dialog.open(AddFigureDialogComponent, {
      width: '70%',
      height: '70%',
      data: {fig,updateOnSave:false,index:figIndex},
      disableClose: false
    }).afterClosed().subscribe(result => {
      this.figures?.splice(figIndex,1,result.figure)
    })
  }

  addFigure(){
    this.dialog.open(AddFigureDialogComponent, {
      width: '70%',
      height: '70%',
      data:{fig:undefined,updateOnSave:false,index:this.figures?.length},
      disableClose: false
    }).afterClosed().subscribe(result => {
      this.figures?.push(result.figure)
    })
  }

  saveFigures(){
    this.figuresControllerService.writeFiguresDataGlobal(this.figures!)
    this.dialogRef.close()
  }

  cancelFiguresEdit(){
    this.dialogRef.close()
  }
}
