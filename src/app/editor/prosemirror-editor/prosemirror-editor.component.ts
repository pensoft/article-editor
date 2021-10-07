import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { articleSection, editorData } from '../utils/interfaces/articleSection';

@Component({
  selector: 'app-prosemirror-editor',
  templateUrl: './prosemirror-editor.component.html',
  styleUrls: ['./prosemirror-editor.component.scss']
})
export class ProsemirrorEditorComponent implements AfterViewInit{

  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;
  @Input('data') data?:{contentData:editorData,sectionData:articleSection}

  constructor(private prosemirrorService:ProsemirrorEditorsService,
    private ydocService:YdocService,) { }

  ngAfterViewInit(): void {
    let awaitValue = ()=>{
      setTimeout(() => {
        if(this.data){
          renderEditor()
        }else{
          awaitValue()
        }
      }, 100);
    }
    let renderEditor = ()=>{
      try{
        this.prosemirrorService.renderEditorIn(this.editor?.nativeElement,this.data?.contentData!,this.data?.sectionData!)
      }catch(e){
        console.log(e);
      }
    }
    awaitValue()
  }
}
