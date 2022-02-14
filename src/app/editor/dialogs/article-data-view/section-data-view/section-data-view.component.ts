import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CopiedToClipBoardComponent } from '@app/editor/snack-bars/copied-to-clip-board/copied-to-clip-board.component';

@Component({
  selector: 'app-section-data-view',
  templateUrl: './section-data-view.component.html',
  styleUrls: ['./section-data-view.component.scss']
})
export class SectionDataViewComponent implements AfterViewInit {

  @Input()  sectionData!: {sectionName:string,sectionHtml:string,sectionJson:any,controlValues:any};
  @Output() sectionDataChange = new EventEmitter<{sectionName:string,sectionHtml:string,sectionJson:any,controlValues:any}>();

  constructor(private _snackBar: MatSnackBar,) { }

  ngAfterViewInit(): void {
  }

  copyJSONToClipboard(){
    var myjson = JSON.stringify(this.sectionData.sectionJson, null, 2);
    navigator.clipboard.writeText(myjson);
    this._snackBar.openFromComponent(CopiedToClipBoardComponent, {
      duration: 3 * 1000,
    });
  }

  openRawJSON(){
    var myjson = JSON.stringify(this.sectionData.sectionJson, null, 2);
    var x = window.open();
    x!.document.open();
    x!.document.write('<html><body><pre>' + myjson.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></body></html>');
    x!.document.close();
  }

  copyHTMLToClipboard(){
    navigator.clipboard.writeText(this.sectionData.sectionHtml);
    this._snackBar.openFromComponent(CopiedToClipBoardComponent, {
      duration: 3 * 1000,
    });
  }

  copySectionValuesToClipboard(){
    var myjson = JSON.stringify(this.sectionData.controlValues, null, 2);
    navigator.clipboard.writeText(myjson);
    this._snackBar.openFromComponent(CopiedToClipBoardComponent, {
      duration: 3 * 1000,
    });
  }

}
