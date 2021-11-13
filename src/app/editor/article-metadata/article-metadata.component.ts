import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FiguresDialogComponent } from '../dialogs/figures-dialog/figures-dialog.component';

@Component({
  selector: 'app-article-metadata',
  templateUrl: './article-metadata.component.html',
  styleUrls: ['./article-metadata.component.scss']
})
export class ArticleMetadataComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openFiguresDialog(){
    this.dialog.open(FiguresDialogComponent, {
      width: '95%',
      height: '90%',
      data: { },
      disableClose: false
    }).afterClosed().subscribe(result => {

    })
  }
}
