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

  error: boolean = false
  figuresData?: string[]
  figures: { [key: string]: figure }
  selectedFigures: boolean[] = []
  figuresComponentsChecked: { [key: string]: boolean[] } = {}

  constructor(
    private ydocService: YdocService,
    private figuresControllerService: FiguresControllerService,
    private dialogRef: MatDialogRef<InsertFigureComponent>,
    private commentsPlugin: CommentsService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    @Inject(MAT_DIALOG_DATA) public data: { view: EditorView }
  ) {
    this.figuresData = this.ydocService.figuresMap?.get('ArticleFiguresNumbers')
    this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
    Object.keys(this.figures).forEach((figID, i) => {
      this.figuresComponentsChecked[figID] = this.figures[figID].components.map(c => false);
      this.selectedFigures[i] = false;
    })
  }

  getCharValue(i: number) {
    return String.fromCharCode(97 + i)
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
  }

  citateFigures() {
    try {
      if (this.selectedFigures.length == 0) {
        this.error = true
        setTimeout(() => {
          this.error = false
        }, 3000)
      } else {
        let sectionID = this.commentsPlugin.commentPluginKey.getState(this.data.view.state).sectionName
        this.figuresControllerService.citateFigures(this.selectedFigures, this.figuresComponentsChecked, sectionID)
        this.prosemirrorEditorsService.dispatchEmptyTransaction()
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
