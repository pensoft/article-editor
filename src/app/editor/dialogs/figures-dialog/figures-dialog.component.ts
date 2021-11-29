import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FiguresFormgroupsService } from '@app/editor/services/figures-formgroups.service';
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
    private figuresFormGroupsService:FiguresFormgroupsService
  ) { }

  ngAfterViewInit(): void {
    this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.figures!, event.previousIndex, event.currentIndex);
    this.ydocService.figuresMap?.set('ArticleFigures',this.figures)

    //this.ydocService.figuresMap?.set('ArticleFigures',)
  }

  editFigure(fig:figure,figIndex:number){
    this.dialog.open(AddFigureDialogComponent, {
      width: '70%',
      height: '70%',
      data: fig,
      disableClose: false
    }).afterClosed().subscribe(result => {
      //console.log('Figure from edit',result);
      this.figures?.splice(figIndex,1,result.figure)
      this.ydocService.figuresMap?.set('ArticleFigures',this.figures)
    })
  }

  addFigure(){
    this.dialog.open(AddFigureDialogComponent, {
      width: '70%',
      height: '70%',
      data: undefined,
      disableClose: false
    }).afterClosed().subscribe(result => {
      this.figures?.push(result.figure)
      this.ydocService.figuresMap?.set('ArticleFigures',this.figures)
    })
  }
}
