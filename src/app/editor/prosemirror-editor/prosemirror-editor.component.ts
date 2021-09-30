import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { ydocData } from '../utils/interfaces/ydocData';



@Component({
  selector: 'app-prosemirror-editor',
  templateUrl: './prosemirror-editor.component.html',
  styleUrls: ['./prosemirror-editor.component.scss']
})
export class ProsemirrorEditorComponent implements AfterViewInit {

  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;


  constructor(private prosemirrorService : ProsemirrorEditorsService,private ydocService:YdocService) {
  }

  ngAfterViewInit(){
    let ref = this.editor?.nativeElement as HTMLDivElement
    let editorOuterDiv = ref.parentElement?.getElementsByClassName('editor-outer-div').item(0) as HTMLDivElement
    let i =()=>{
      let editorDiv = this.prosemirrorService.init()!;
      ref.parentElement?.appendChild(editorDiv)
    }
    if(!this.ydocService.editorIsBuild){
      
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          return i()
        }
      });
    }else{
      return i()
    }

    
    
  }
}
