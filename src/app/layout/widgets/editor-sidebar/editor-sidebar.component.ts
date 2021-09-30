import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'editor-sidebar',
  templateUrl: './editor-sidebar.component.html',
  styleUrls: ['./editor-sidebar.component.scss']
})
export class EditorSidebarComponent implements OnInit {

  @Input() sidebar = '';

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { sidebar: string },
    private bottomSheetRef: MatBottomSheetRef<EditorSidebarComponent>) {
    this.sidebar = data.sidebar;
  }

  ngOnInit(): void {
  }

  closeSheet() {
    this.bottomSheetRef.dismiss();
  }

}
