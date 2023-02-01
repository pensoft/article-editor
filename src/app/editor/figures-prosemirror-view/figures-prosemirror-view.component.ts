import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { editorContainer, ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { figure } from '../utils/interfaces/figureComponent';

@Component({
  selector: 'app-figures-prosemirror-view',
  templateUrl: './figures-prosemirror-view.component.html',
  styleUrls: ['./figures-prosemirror-view.component.scss']
})
export class FiguresProsemirrorViewComponent implements AfterViewInit {

  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;
  @Input() figures!: figure[];
  endEditorContainer?:editorContainer

  constructor(
    private prosemirrEditorsService:ProsemirrorEditorsService,
    private ydocService:YdocService
    ) {}

  ngAfterViewInit(): void {
    try{
      //this.figuresControllerService.setRenderEndEditorFunction(this.renderEndEditor)
      if (this.ydocService.editorIsBuild) {
        this.renderEndEditor()
      } else {
        this.ydocService.ydocStateObservable.subscribe((event) => {
          if (event == 'docIsBuild') {
            this.renderEndEditor()
          }
        });
      }
    }catch(e){
      console.error(e)
    }
  }

  renderEndEditor = ()=>{
    this.endEditorContainer = this.prosemirrEditorsService.renderDocumentEndEditor(this.ProsemirrorEditor?.nativeElement);

  }


}
