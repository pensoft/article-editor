import { DomElementSchemaRegistry } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { ChooseSectionComponent } from '../dialogs/choose-section/choose-section.component';
import { FiguresDialogComponent } from '../dialogs/figures-dialog/figures-dialog.component';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { FiguresControllerService } from '../services/figures-controller.service';
import { YdocService } from '../services/ydoc.service';

@Component({
  selector: 'app-article-metadata',
  templateUrl: './article-metadata.component.html',
  styleUrls: ['./article-metadata.component.scss']
})
export class ArticleMetadataComponent implements OnInit {

  sectionTemplates:any

  constructor(
    public dialog: MatDialog,
    private sectionsService:ArticleSectionsService,
    private figuresControllerService:FiguresControllerService,
    private ydocService:YdocService,
    private treeService:TreeService,) { }


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

  resetCitatsObj(){
    let articleCitatsObj = this.ydocService.figuresMap?.get('articleCitatsObj');
    Object.keys(articleCitatsObj).forEach((sectionId)=>{
      articleCitatsObj[sectionId] = {}
    })
    this.ydocService.figuresMap?.set('articleCitatsObj',articleCitatsObj);
    this.figuresControllerService.markCitatsViews(articleCitatsObj);
  }

  addNewSectionToArticle(){
    this.sectionsService.getAllSections({page:1,pageSize:999}).subscribe((response:any)=>{
      //this.sectionTemplates = response.data
      this.sectionTemplates = response.data.filter((data:any)=>{
        return (
          this.treeService.articleSectionsStructure?.findIndex((element)=>{return (data.id == element.sectionTypeID&&(element.sectionMeta.main==true))}) == -1


        )
      })
      const dialogRef = this.dialog.open(ChooseSectionComponent, {
        width: '563px',
        panelClass:'choose-namuscript-dialog',
        data: { templates: this.sectionTemplates }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.sectionsService.getSectionById(result).subscribe((res:any)=>{
          let sectionTemplate = res.data
          this.treeService.addNodeAtPlaceChange('parentList',sectionTemplate,'end');
        })
      });
    })
  }
}
