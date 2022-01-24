//@ts-ignore
import { acceptChange, rejectChange } from '../../utils/trackChanges/acceptReject.js';
import { Component, Input, OnInit } from '@angular/core';
import { EditorView } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.scss']
})
export class ChangeComponent implements OnInit {

  @Input() change: any;

  constructor() { }

  ngOnInit(): void {
  }

  acceptChange(view: any, from: any, to: any) {
    let position = {
      from: from,
      to: to
    }
    acceptChange(view, position)
  }

  declineChange(view: any, from: any, to: any) {
    let position = {
      from: from,
      to: to
    }
    rejectChange(view, position);
  }

  focusCitat(){
    console.log(this.change);
    let changeMiddle = (this.change.from+this.change.to)/2
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
