import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { CommentsService } from '@app/editor/utils/commentsService/comments.service';
import { figure } from '@app/editor/utils/interfaces/figureComponent';
import { EditorView } from 'prosemirror-view';

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
  
  error : boolean = false
  figuresData?:string[]
  selectedFigures:number[] = []
  figures
  constructor(
    private ydocService:YdocService,
    private figuresControllerService:FiguresControllerService,
    private dialogRef: MatDialogRef<InsertFigureComponent>,
    private commentsPlugin:CommentsService,
    private prosemirrorEditorsService:ProsemirrorEditorsService,
    @Inject(MAT_DIALOG_DATA) public data: {view:EditorView}
  ) {
    this.figuresData = this.ydocService.figuresMap?.get('ArticleFiguresNumbers')
    this.figures =  this.ydocService.figuresMap?.get('ArticleFigures')
  }


  setSelection(checked: boolean,figureId:string,figIndex:number) {
    if(checked){
      this.selectedFigures.push(figIndex)
    }else{
      this.selectedFigures = this.selectedFigures.filter(n => n!==figIndex);
    }
    this.selectedFigures.sort()

  }
  
  ngAfterViewInit(): void {
  }

  citateFigures(){
    try{
      if(this.selectedFigures.length==0){
        this.error = true
        setTimeout(()=>{
          this.error = false
        },3000)
      }else{
        let sectionID = this.commentsPlugin.commentPluginKey.getState(this.data.view.state).sectionName
        this.figuresControllerService.citateFigures(this.selectedFigures,sectionID)
        this.prosemirrorEditorsService.dispatchEmptyTransaction()
        this.dialogRef.close()
      }
    }
    catch(e){
      console.error(e);
    }
  }

  cancel(){
    this.dialogRef.close()
  }
}
