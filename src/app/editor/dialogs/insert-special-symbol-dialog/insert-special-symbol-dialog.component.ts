import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-insert-special-symbol-dialog',
  templateUrl: './insert-special-symbol-dialog.component.html',
  styleUrls: ['./insert-special-symbol-dialog.component.scss']
})
export class InsertSpecialSymbolDialogComponent implements OnInit {

  size: number[] = Array.from({length: 50}, (_, i) => i + 1);

  constructor(
    private dialogRef: MatDialogRef<InsertSpecialSymbolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(data: any) {
    this.dialogRef.close({ data });
  }
}
