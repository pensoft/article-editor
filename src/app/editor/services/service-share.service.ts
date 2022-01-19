import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { uuidv4 } from 'lib0/random';
import { ChooseManuscriptDialogComponent } from '../dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { renderSectionFunc } from '../utils/articleBasicStructure';
import { CommentsService } from '../utils/commentsService/comments.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { complexSectionFormIoSchema } from '../utils/section-templates/form-io-json/complexSection';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';
import { FiguresControllerService } from './figures-controller.service';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceShare {

  articleTemplates:any

  ProsemirrorEditorsService?:ProsemirrorEditorsService
  YdocService?:YdocService
  FiguresControllerService?:FiguresControllerService
  TreeService?:TreeService
  CommentsService?:CommentsService
  DetectFocusService?:DetectFocusService
  TrackChangesService?:TrackChangesService
  ArticleSectionsService?:ArticleSectionsService
  ArticlesService?:ArticlesService

  constructor(
    public dialog: MatDialog,
    private router: Router,
    ) {

  }

  resetServicesData (){
    this.ProsemirrorEditorsService?.resetProsemirrorEditors();
    this.YdocService?.resetYdoc();
    this.FiguresControllerService?.resetFiguresControllerService();
    this.TreeService?.resetTreeData();
    this.CommentsService?.resetCommentsService();
    this.DetectFocusService?.resetDetectFocusService();
    this.TrackChangesService?.resetTrackChangesService();
  }

  createNewArticle(){
    this.ArticleSectionsService!.getAllTemplates().subscribe((articleTemplates: any) => {
      this.articleTemplates = articleTemplates
      const dialogRef = this.dialog.open(ChooseManuscriptDialogComponent, {
        width: '100%',
        panelClass:'choose-namuscript-dialog',
        data: { templates: articleTemplates }
      });
      dialogRef.afterClosed().subscribe(result => {

        let selectedTemplate = (this.articleTemplates.data as Array<any>).find((template: any) => {
          return template.id == result
        })
        let articleStructure: articleSection[] = []
        let filteredSections = selectedTemplate.sections.filter((section: any) => { return section.type == 0 });

        selectedTemplate.sections.forEach((section: any) => {
          if(section.settings&&section.settings.main_section == true){
            renderSectionFunc(section,articleStructure,'end');
          }
        })
        this.YdocService!.articleStructureFromBackend = articleStructure;
        this.ArticlesService!.createArticle('Untitled',+result).subscribe((createArticleRes:any)=>{
          this.resetServicesData();
          this.YdocService!.setArticleData(createArticleRes.data)
          this.router.navigate([createArticleRes.data.uuid])
        })
      });
    })
  }
  shareSelf(serviceName:string,serviceInstance:any){
    //@ts-ignore
    this[serviceName] = serviceInstance
  }
}
