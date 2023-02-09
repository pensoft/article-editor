import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-figure-pdf-preview',
  templateUrl: './figure-pdf-preview.component.html',
  styleUrls: ['./figure-pdf-preview.component.scss']
})
export class FigurePdfPreviewComponent implements OnInit {

  showPdfView = false;
  figureRows:any[][] = []
  maxImgHeightPers
  rowTemplate:any[] = []
  maxImgWidthPers?:number;
  bottomOffset = 0.30; // offset the figures images from the bottom of the list in preview- figure description space

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      figureRows:any[][],
      maxImgHeightPers:any,
      rowTemplate:any[],
      maxImgWidthPers?:number,
      bottomOffset:number,
    }
  ) {
    this.figureRows = data.figureRows
    this.maxImgHeightPers = data.maxImgHeightPers
    this.rowTemplate = data.rowTemplate
    this.maxImgWidthPers = data.maxImgWidthPers
    this.bottomOffset = data.bottomOffset
    this.showPdfView = true;
  }

  ngOnInit(): void {
  }


}
