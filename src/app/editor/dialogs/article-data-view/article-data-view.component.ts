import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';

@Component({
  selector: 'app-article-data-view',
  templateUrl: './article-data-view.component.html',
  styleUrls: ['./article-data-view.component.scss']
})
export class ArticleDataViewComponent implements AfterViewInit {

  articleSectionsStructure?:articleSection[]
  sectionFormGroups: any
  articleCitatsObj: any
  ArticleFigures: any
  sectionsData:{sectionName:string,sectionHtml:string,sectionJson:any,controlValues:any}[] = []

  constructor(
    public dialog: MatDialog,
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
    console.log(this.sectionsData);
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
}
