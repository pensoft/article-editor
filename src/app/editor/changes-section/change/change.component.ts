import { acceptChange, rejectChange } from '../../utils/trackChanges/acceptReject';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EditorView } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';
import { TrackChangesService } from '@app/editor/utils/trachChangesService/track-changes.service';
import { getDate } from '@app/editor/comments-section/comment/comment.component';
import { Subscription } from 'rxjs';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit ,AfterViewInit,OnDestroy{

  @Input() change: any;
  @Input() index!: number;
  sub?:Subscription
  previewMode
  constructor(
    public changesService: TrackChangesService,
    private serviceShare:ServiceShare
    ) {
    this.previewMode = serviceShare.ProsemirrorEditorsService!.previewArticleMode
    this.sub = this.changesService.changesFocusFunctions.subscribe((index)=>{
      if(index == this.index){
        this.focusCitat()
      }
    })
  }

  ngOnDestroy(): void {
    this.sub?this.sub.unsubscribe():undefined
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  acceptChange(view: any, type: any, attrs: any) {
    acceptChange(view, type,attrs)
  }

  declineChange(view: any, type: any, attrs: any) {
    rejectChange(view, type,attrs);
  }

  getDate = getDate

  focusCitat = ()=>{
    this.changesService.focusedChangeIndex = this.index
    let changeMiddle = Math.floor((this.change.from+this.change.to)/2)
    if(this.change.from == this.change.to+1){
      changeMiddle = this.change.from
    }
    let view:EditorView = this.change.viewRef
    let sel = view.state.selection
    if((sel.from < this.change.to&&sel.from>this.change.from)||(sel.to < this.change.to&&sel.to>this.change.from)){
      return
    }
    view.dispatch(view.state.tr.setSelection(new TextSelection(view.state.doc.resolve(changeMiddle))));
    view.focus()
    view.dispatch(view.state.tr.scrollIntoView())
  }

}
