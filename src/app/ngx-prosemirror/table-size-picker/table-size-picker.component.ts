import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DialogData {
  rows: number;
  cols: number;
}

@Component({
  selector: 'app-table-size-picker',
  templateUrl: './table-size-picker.component.html',
  styleUrls: ['./table-size-picker.component.scss']
})
export class TableSizePickerComponent {

  SIZE = 8;
  idsToHover: number[] = [];
  selectedRow: number = 0;
  selectedCell: number = 0;
  blockHover = false;

  constructor(
    public dialogRef: MatDialogRef<TableSizePickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  tablePickerHover(event: any) {
    if (this.blockHover) {
      return;
    }

    let id = event?.target?.id;
    if (id) {
      this.idsToHover = [];
      this.selectedRow = Math.floor(id / this.SIZE) + 1;
      this.selectedCell = Math.floor(id % this.SIZE) + 1;
      for (let row = 0; row < this.selectedRow; row++) {
        for (let cell = 0; cell < this.selectedCell; cell++) {
          this.idsToHover.push(row * this.SIZE + cell);
        }
      }
    }
  }

  chooseSize() {
    this.data.rows = this.selectedRow;
    this.data.cols = this.selectedCell;
    this.dialogRef.close(this.data);
  }
}
