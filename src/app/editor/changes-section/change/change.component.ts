//@ts-ignore
import { acceptChange, rejectChange } from '../../utils/trackChanges/acceptReject.js';
import { Component, Input, OnInit } from '@angular/core';

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



}
