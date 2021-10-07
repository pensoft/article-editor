import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild ,AfterContentInit, ChangeDetectorRef} from '@angular/core';
import { FormioCustomComponent } from '@formio/angular';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
import * as Y from 'yjs'
import { AbstractType } from 'yjs';
import { Components, MaterialComponent, registerComponent } from 'src/app/formio-angular-material/angular-material-formio.module';
import { articleSection, editorData, editorMeta, sectionContentData, titleContentData } from '../../utils/interfaces/articleSection';
import { YdocCopyService } from '../../services/ydoc-copy.service';
@Component({
  selector: 'app-editor-section',
  templateUrl: './editor-section.component.html',
  styleUrls: ['./editor-section.component.scss']
})
export class EditorSectionComponent extends MaterialComponent implements AfterViewInit {
  newValue?:{contentData:editorData,sectionData:articleSection}
  value?: {contentData:editorData,sectionData:articleSection};

  renderEditor=false;
  editorData?:editorData;

  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;

  constructor(
    private prosemirrorService:ProsemirrorEditorsService,
    private ydocService:YdocService,
    private ydocCopyService:YdocCopyService,
    public element: ElementRef, 
    public ref: ChangeDetectorRef) { 
      super(element,ref)
  }

  
  ngAfterViewInit(): void {
    let awaitValue = ()=>{
      setTimeout(() => {
        if(this.value!==undefined){
          renderEditor()
        }else{
          awaitValue()
        }
      }, 100);
    }
    this.value= this.control.value as {contentData:editorData,sectionData:articleSection}
    awaitValue()
    let renderEditor = ()=>{
      try{
        this.render(this.value!.contentData)
      }catch(e){
        console.log(e);
      }
    }
  }

  render(editorData:editorData){
    this.editorData = editorData
    this.renderEditor = true;
  }
}
