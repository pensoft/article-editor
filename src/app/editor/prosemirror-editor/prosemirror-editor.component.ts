import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';



@Component({
  selector: 'app-prosemirror-editor',
  templateUrl: './prosemirror-editor.component.html',
  styleUrls: ['./prosemirror-editor.component.scss']
})
export class ProsemirrorEditorComponent implements AfterViewInit {

  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;


  constructor(private prosemirrorService : ProsemirrorEditorsService) {
  }

  ngAfterViewInit(){
    let editorDiv = this.prosemirrorService.init();
    let ref = this.editor?.nativeElement as HTMLDivElement
    ref.parentElement?.appendChild(editorDiv)
  }
}
