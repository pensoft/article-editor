import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-figure-component-preview',
  templateUrl: './figure-component-preview.component.html',
  styleUrls: ['./figure-component-preview.component.scss']
})
export class FigureComponentPreviewComponent implements AfterViewInit {

  @Input() component:any;
  @Output() componentChange = new EventEmitter<any>();
  constructor(

  ) { }

  ngAfterViewInit(): void {

  }

}
