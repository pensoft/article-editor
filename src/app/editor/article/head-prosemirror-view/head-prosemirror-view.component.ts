import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { editorContainer, ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { figure } from '@app/editor/utils/interfaces/figureComponent';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-head-prosemirror-view',
  templateUrl: './head-prosemirror-view.component.html',
  styleUrls: ['./head-prosemirror-view.component.scss']
})
export class HeadProsemirrorViewComponent implements AfterViewInit {

  @ViewChild('ProsemirrorEditor', { read: ElementRef }) ProsemirrorEditor?: ElementRef;

  constructor(
    private ydocService:YdocService,
    private serviceShare:ServiceShare
  ){

  }

  ngAfterViewInit(): void {
    try{
      if (this.ydocService.editorIsBuild) {
        this.serviceShare.CollaboratorsService.renderHeadEditor(this.ProsemirrorEditor?.nativeElement)
      } else {
        this.ydocService.ydocStateObservable.subscribe((event) => {
          if (event == 'docIsBuild') {
            this.serviceShare.CollaboratorsService.renderHeadEditor(this.ProsemirrorEditor?.nativeElement)
          }
        });
      }
    }catch(e){
      console.error(e)
    }
  }
}
