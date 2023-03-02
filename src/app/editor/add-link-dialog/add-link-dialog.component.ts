import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
@Component({
  selector: 'app-add-link-dialog',
  templateUrl: './add-link-dialog.component.html',
  styleUrls: ['./add-link-dialog.component.scss']
})
export class AddLinkDialogComponent implements AfterViewInit, OnDestroy{

  text = new FormControl('', [Validators.required]);
  @ViewChild('linkurlinput', { read: ElementRef }) linkurlinput?: ElementRef;

  type :string
  constructor(public dialogRef: MatDialogRef<AddLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref:ChangeDetectorRef,
    private detectFocusService: DetectFocusService) {
      this.type = data.type
     }

  ngAfterViewInit(): void {
    this.detectFocusService.setSelectionDecorationOnLastSelecctedEditor();
    this.linkurlinput.nativeElement.focus()
    this.ref.detectChanges();
  }

  getErrorMessage() {
    if (this.text.hasError('required')) {
      return 'You must enter a value';
    }

    return '';
  }

  ngOnDestroy(): void {
    this.detectFocusService.removeSelectionDecorationOnLastSelecctedEditor();
  }
}
