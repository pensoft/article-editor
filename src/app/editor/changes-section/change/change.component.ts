import { acceptChange, rejectChange } from '../../utils/trackChanges/acceptReject';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EditorView } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';
import { TrackChangesService } from '@app/editor/utils/trachChangesService/track-changes.service';
import { getDate } from '@app/editor/comments-section/comment/comment.component';
import { Subject, Subscription } from 'rxjs';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { changeData } from '../changes-section.component';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit ,AfterViewInit,OnDestroy{

  @Input() change: changeData;
  @Input() index: number;

  @Input() doneRenderingChangesSubject?: Subject<any>;
  @Output() doneRenderingChangesSubjectChange = new EventEmitter<Subject<any>>();

  @Output() selected = new EventEmitter<boolean>();

  sub?:Subscription
  previewMode
  constructor(
    public changesService: TrackChangesService,
    private serviceShare:ServiceShare,
    public ydocService:YdocService
    ) {
    this.previewMode = serviceShare.ProsemirrorEditorsService!.previewArticleMode
  }

  ngOnDestroy(): void {
    this.sub?this.sub.unsubscribe():undefined
  }

  currUserId;
  ngOnInit(): void {
    this.serviceShare.AuthService.getUserInfo().subscribe((userInfo)=>{
      this.currUserId = userInfo.data.id
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.doneRenderingChangesSubject.next('rendered')
    }, 10)
    this.changesService.lastSelectedChangeSubject.subscribe((change) => {
      if(this.ydocService.curUserAccess&&this.ydocService.curUserAccess=='Viewer'){
        return
      }
      if (this.change.changeMarkId == change.changeMarkId) {
        this.selected.emit(true);
      } else {
        this.selected.emit(false);
      }
    })
  }

  acceptChange(type: any, attrs: any) {
    let view = this.serviceShare.ProsemirrorEditorsService.editorContainers[this.change.section].editorView
    acceptChange(view, type,attrs)
    this.changesService.getChangesInAllEditors()
  }

  declineChange(type: any, attrs: any) {
    let view = this.serviceShare.ProsemirrorEditorsService.editorContainers[this.change.section].editorView
    rejectChange(view, type,attrs);
    this.changesService.getChangesInAllEditors()
  }

  getDate = getDate
}
