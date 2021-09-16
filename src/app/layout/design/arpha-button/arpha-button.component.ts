import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'arpha-button',
  templateUrl: './arpha-button.component.html',
  styleUrls: ['./arpha-button.component.scss']
})
export class ArphaButtonComponent implements OnInit {

  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() icon: string = '';

  @Output() clickEvent: EventEmitter<MouseEvent> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onButtonClick(event: any) {
    this.clickEvent.emit(event);
    event.stopPropagation();
  }

}
