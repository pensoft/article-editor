import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { figure } from '../utils/interfaces/figureComponent';

@Component({
  selector: 'app-figures-prosemirror-view',
  templateUrl: './figures-prosemirror-view.component.html',
  styleUrls: ['./figures-prosemirror-view.component.scss']
})
export class FiguresProsemirrorViewComponent implements AfterViewInit {

  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;
  @Input() figures!: figure[];
  endEditorContainer?:{
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }
  
  constructor(private prosemirrEditorsService:ProsemirrorEditorsService) {}

  ngAfterViewInit(): void {
    this.endEditorContainer = this.prosemirrEditorsService.renderDocumentEndEditor(this.ProsemirrorEditor?.nativeElement,this.figures);
  }

}
