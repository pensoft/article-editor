import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CopiedToClipBoardComponent } from '@app/editor/snack-bars/copied-to-clip-board/copied-to-clip-board.component';
import { articleSection, flatArticleSection } from '@app/editor/utils/interfaces/articleSection';
import { isArray } from 'lodash';

@Component({
  selector: 'app-article-data-view',
  templateUrl: './article-data-view.component.html',
  styleUrls: ['./article-data-view.component.scss']
})
export class ArticleDataViewComponent implements AfterViewInit {

  articleSectionsStructure?:articleSection[]
  flatArticleSectionsStructure?: any
  sectionFormGroups: any
  articleCitatsObj: any
  ArticleFigures: any
  sectionsData:{sectionName:string,sectionHtml:string,sectionJson:any,controlValues:any}[] = []

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ArticleDataViewComponent>,
    private changeDetectionRef: ChangeDetectorRef
    ,@Inject(MAT_DIALOG_DATA) public data: {
        articleSectionsStructure: any,
        sectionFormGroups: any,
        articleCitatsObj: any,
        ArticleFigures: any
      }
    ) { }

  ngAfterViewInit(): void {
    this.articleSectionsStructure = this.data.articleSectionsStructure as articleSection[]
    this.flatArticleSectionsStructure = this.getFlatArticleStructure(this.data.articleSectionsStructure) as flatArticleSection[]
    this.sectionFormGroups = this.data.sectionFormGroups
    this.articleCitatsObj = this.data.articleCitatsObj
    this.ArticleFigures = this.data.ArticleFigures
    let iterateArticleSections = (sections:articleSection[],)=>{
      sections.forEach((sec)=>{
        this.sectionsData.push({sectionName:sec.title.label,sectionHtml:sec.prosemirrorHTMLNodesTempl!,sectionJson:sec.formIOSchema,controlValues:(this.sectionFormGroups[sec.sectionID] as FormControl).value});
        if(sec.type == 'complex'&&sec.children.length>0){
          iterateArticleSections(sec.children)
        }
      })
    }
    iterateArticleSections(this.articleSectionsStructure);
    this.changeDetectionRef.detectChanges()
  }

  closeDialog(){
    this.dialogRef.close();
  }

  showHideElement(div:HTMLDivElement,showHideBtn:MatButton){
    if(div.style.display == 'none'){
      div.style.display = 'block';
      showHideBtn._elementRef.nativeElement.firstChild.textContent = showHideBtn._elementRef.nativeElement.firstChild.textContent.replace('Show','Hide')
    }else if(div.style.display == 'block'){
      div.style.display = 'none';
      showHideBtn._elementRef.nativeElement.firstChild.textContent = showHideBtn._elementRef.nativeElement.firstChild.textContent.replace('Hide','Show')

    }
    this.changeDetectionRef.detectChanges()
  }

  copyJSONToClipboard(){
    var myjson = JSON.stringify(this.articleSectionsStructure, null, 2);
    navigator.clipboard.writeText(myjson);
    this._snackBar.openFromComponent(CopiedToClipBoardComponent, {
      duration: 3 * 1000,
    });
  }
  copyFlatJSONToClipboard(){
    var myjson = JSON.stringify(this.flatArticleSectionsStructure, null, 2);
    navigator.clipboard.writeText(myjson);
    this._snackBar.openFromComponent(CopiedToClipBoardComponent, {
      duration: 3 * 1000,
    });
  }

  openRawJSON(){
    var myjson = JSON.stringify(this.articleSectionsStructure, null, 2);
    var x = window.open();
    x!.document.open();
    x!.document.write('<html><body><pre>' + myjson.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></body></html>');
    x!.document.close();
  }

  getFlatArticleStructure(articleSectionsStructure: articleSection[]){
    const flatten = (node: articleSection | articleSection[], parentSectionID: string = 'root', flatArray: flatArticleSection[] = []): flatArticleSection[] => {
      if (isArray(node)) {
        node.forEach(section => {
          flatten(section, parentSectionID, flatArray);
        })
      } else if (node.sectionID) {
        flatArray.push({
          title: node.title.name || '',
          sectionID: node.sectionID,
          parentSectionID,
          prosemirrorHTMLNodesTempl: node.prosemirrorHTMLNodesTempl || ''
        });

        if (node.children && node.children.length) {
          node.children.forEach((child: articleSection) => {
            flatten(child, node.sectionID, flatArray);
          });
        }
      }
      return flatArray;
    }
    return flatten(articleSectionsStructure);
  }
}
