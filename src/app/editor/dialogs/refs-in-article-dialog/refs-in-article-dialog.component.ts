import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RefsAddNewInArticleDialogComponent } from '../refs-add-new-in-article-dialog/refs-add-new-in-article-dialog.component';

@Component({
  selector: 'app-refs-in-article-dialog',
  templateUrl: './refs-in-article-dialog.component.html',
  styleUrls: ['./refs-in-article-dialog.component.scss']
})
export class RefsInArticleDialogComponent implements OnInit {


    constructor(
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<RefsInArticleDialogComponent>
      ) { }

  ngOnInit(): void {
  }

  openAddNewRefToEditorDialog(){
    const dialogRef = this.dialog.open(RefsAddNewInArticleDialogComponent, {
      panelClass: 'refs-add-new-in-article-dialog',
      width: '70%',
      height: '70%',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {


      }
    })
  }
}
