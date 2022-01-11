import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { ChooseSectionComponent } from '../dialogs/choose-section/choose-section.component';
import { FiguresDialogComponent } from '../dialogs/figures-dialog/figures-dialog.component';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';

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

  addNewSectionToArticle(){
    this.sectionsService.getAllSections().subscribe((response:any)=>{
      this.sectionTemplates = response.data
      console.log(this.sectionTemplates);
      const dialogRef = this.dialog.open(ChooseSectionComponent, {
        width: '100%',
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
