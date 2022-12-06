import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ServiceShare } from '../services/service-share.service';

@Component({
  selector: 'app-editor-container',
  templateUrl: './editor-container.component.html',
  styleUrls: ['./editor-container.component.scss']
})
export class EditorContainerComponent implements AfterViewInit {

  renderEditor = true;

  constructor(
    private serviceShare:ServiceShare
  ){

  }

  ngAfterViewInit(): void {
/* z */
  }

}
