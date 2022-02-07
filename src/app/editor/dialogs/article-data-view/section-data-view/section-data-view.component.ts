import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-section-data-view',
  templateUrl: './section-data-view.component.html',
  styleUrls: ['./section-data-view.component.scss']
})
export class SectionDataViewComponent implements AfterViewInit {

  @Input()  sectionData!: {sectionName:string,sectionHtml:string,sectionJson:any,controlValues:any};
  @Output() sectionDataChange = new EventEmitter<{sectionName:string,sectionHtml:string,sectionJson:any,controlValues:any}>();

  constructor() { }

  ngAfterViewInit(): void {
      console.log(this.sectionData);
  }

}
