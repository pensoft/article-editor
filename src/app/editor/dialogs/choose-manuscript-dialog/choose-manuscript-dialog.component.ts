import { ThisReceiver } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { uuidv4 } from "lib0/random";

@Component({
  selector: 'app-choose-manuscript-dialog',
  templateUrl: './choose-manuscript-dialog.component.html',
  styleUrls: ['./choose-manuscript-dialog.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ChooseManuscriptDialogComponent implements OnInit, AfterViewInit, AfterViewChecked {

  showError = false;
  articleTemplates: any[] = [];
  value?: string;
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChooseManuscriptDialogComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { layouts: any },
  ) {

  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.articleTemplates = JSON.parse(JSON.stringify(this.data.layouts.data));

  }

  createManuscript(val: any) {
    if (!val) {
      this.showError = true
      setTimeout(() => {
        this.showError = false
      }, 1000)
    } else {
      this.dialogRef.close(val)
    }
  }

  closeManuscriptChoose() {
    this.dialogRef.close()
  }

  timer:any
  search(input: HTMLInputElement) {
    if(this.timer){
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.value = input.value;

      this.articleTemplates = JSON.parse(JSON.stringify(this.data.layouts.data));
      if (this.value && this.value !== '') {
        this.articleTemplates = this.articleTemplates.filter((article: any) => {
          let articleName = article.name;
          let nameCharArr: string[] = (articleName as string).toLocaleLowerCase().split('').filter((s: string) => { return (/\S/gm).test(s) })
          let valueArr: string[] = this.value!.toLocaleLowerCase().split('').filter((s: string) => { return (/\S/gm).test(s) })
          let found: string[] = []
          let resultArr = valueArr.filter((el) => {
            let inc = false
            let nOfEl = valueArr.filter(el1 => el1 == el).length
            let nOfElFound = found.filter(el1 => el1 == el).length
            let nOfElInitioal = nameCharArr.filter(el1 => el1 == el).length
            if (nameCharArr.includes(el) && nOfElFound < nOfEl && nOfElFound < nOfElInitioal) {

              found.push(el);
              inc = true;
            }
            return inc
          });
          return resultArr.length == valueArr.length;
        })
      }
      this.timer = undefined
    }, 300)
  }
}
