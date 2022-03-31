import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { uuidv4 } from 'lib0/random';
import { ChooseManuscriptDialogComponent } from '../dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import {  renderSectionFunc } from '../utils/articleBasicStructure';
import { CommentsService } from '../utils/commentsService/comments.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { complexSectionFormIoSchema } from '../utils/section-templates/form-io-json/complexSection';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';
import { YjsHistoryService } from '../utils/yjs-history.service';
import { FiguresControllerService } from './figures-controller.service';
import { PmDialogSessionService } from './pm-dialog-session.service';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { WorkerService } from './worker.service';
import { YdocService } from './ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceShare {

  articleLayouts:any

  ProsemirrorEditorsService?:ProsemirrorEditorsService
  YdocService?:YdocService
  FiguresControllerService?:FiguresControllerService
  TreeService?:TreeService
  CommentsService?:CommentsService
  DetectFocusService?:DetectFocusService
  TrackChangesService?:TrackChangesService
  ArticleSectionsService?:ArticleSectionsService
  ArticlesService?:ArticlesService
  YjsHistoryService?:YjsHistoryService
  PmDialogSessionService?:PmDialogSessionService
  WorkerService?:WorkerService

  constructor(
    public dialog: MatDialog,
    private router: Router,
    ) {

  }

  logData(){
    console.log(this.ProsemirrorEditorsService?.editorContainers);
    console.log(this.YdocService?.ydoc);
    console.log(this.ProsemirrorEditorsService?.transactionCount!+1-1);
    console.log(this.TreeService?.sectionFormGroups);
    this.ProsemirrorEditorsService!.transactionCount = 0;
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
    this.ArticleSectionsService!.getAllLayouts().subscribe((articleLayouts: any) => {
      this.articleLayouts = articleLayouts
      const dialogRef = this.dialog.open(ChooseManuscriptDialogComponent, {
        width: '100%',
        panelClass:'choose-namuscript-dialog',
        data: { layouts: articleLayouts }
      });
      dialogRef.afterClosed().subscribe(result => {

        let selectedLayout = (this.articleLayouts.data as Array<any>).find((layout: any) => {
          return layout.id == result
        }).template
        let articleStructure: articleSection[] = []
        //let filteredSections = selectedLayout.sections.filter((section: any) => { return section.type == 0 });

        selectedLayout.sections.forEach((section: any) => {
          if(section.settings&&section.settings.main_section == true){
            let newSection = renderSectionFunc(section,articleStructure,this.YdocService!.ydoc,'end');
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
