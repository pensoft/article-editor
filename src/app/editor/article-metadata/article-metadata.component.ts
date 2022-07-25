import { DomElementSchemaRegistry } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { AuthService } from '@app/core/services/auth.service';
import { ArticleDataViewComponent } from '../dialogs/article-data-view/article-data-view.component';
import { ChooseSectionComponent } from '../dialogs/choose-section/choose-section.component';
import { FiguresDialogComponent } from '../dialogs/figures-dialog/figures-dialog.component';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { FiguresControllerService } from '../services/figures-controller.service';
import { ServiceShare } from '../services/service-share.service';
import { YdocService } from '../services/ydoc.service';
import print from 'print-js'
import printJS from 'print-js';
import { ArticlesService } from '@app/core/services/articles.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-article-metadata',
  templateUrl: './article-metadata.component.html',
  styleUrls: ['./article-metadata.component.scss']
})
export class ArticleMetadataComponent implements OnInit {

  sectionTemplates: any
  previewMode
  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private sectionsService: ArticleSectionsService,
    private figuresControllerService: FiguresControllerService,
    private ydocService: YdocService,
    private serviceShare: ServiceShare,
    private treeService: TreeService,
    private authService: AuthService) {
    this.previewMode = serviceShare.ProsemirrorEditorsService?.previewArticleMode!
  }


  ngOnInit(): void {
  }

  logToWorker() {
    //this.serviceShare.WorkerService?.logToWorker('qweqwe');
    this.serviceShare.WorkerService?.convertImgInWorker('https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image1.jpg');
  }

  openFiguresDialog() {
    //this.serviceShare.PmDialogSessionService!.createSession()
    this.dialog.open(FiguresDialogComponent, {
      width: '100%',
      height: '90%',
      data: {},
      disableClose: false
    }).afterClosed().subscribe(result => {
      /* if(result){
        this.serviceShare.PmDialogSessionService!.endSession(true)
      }else{
        this.serviceShare.PmDialogSessionService!.endSession(false)
      } */
    })
  }

  refreshToken() {
    this.authService.refreshToken().subscribe((res) => {
    })
  }

  resetCitatsObj() {
    let articleCitatsObj = this.ydocService.figuresMap?.get('articleCitatsObj');
    Object.keys(articleCitatsObj).forEach((sectionId) => {
      articleCitatsObj[sectionId] = {}
    })
    this.ydocService.figuresMap?.set('articleCitatsObj', articleCitatsObj);
    this.figuresControllerService.markCitatsViews(articleCitatsObj);
  }

  logData() {
    this.ydocService.checkLastTimeUpdated()
  }

  updateFigures(){
    this.serviceShare.FiguresControllerService.updateFiguresAndFiguresCitations();
  }

  preventAddToHistory(){
    this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin? this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = null:this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = this.serviceShare.ProsemirrorEditorsService.ySyncKey
  }


  addNewSectionToArticle() {
    let articleSections = this.ydocService.articleData.layout.template.sections.filter((data: any) => {
      return true
      /* return (
        this.treeService.articleSectionsStructure?.findIndex((element)=>{return (data.id == element.sectionTypeID &&(data.settings&&data.settings.main_section==true) )}) == -1
      ) */
    })
    this.sectionTemplates = articleSections;
    const dialogRef = this.dialog.open(ChooseSectionComponent, {
      width: '563px',
      panelClass: 'choose-namuscript-dialog',
      data: { templates: this.sectionTemplates }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.sectionsService.getSectionById(result).subscribe((res: any) => {
        let sectionTemplate = res.data
        this.treeService.addNodeAtPlaceChange('parentList', sectionTemplate, 'end');
      })
    });
    return
    this.sectionsService.getAllSections({ page: 1, pageSize: 999 }).subscribe((response: any) => {
      //this.sectionTemplates = response.data
      this.sectionTemplates = response.data.filter((data: any) => {
        return (
          this.treeService.articleSectionsStructure?.findIndex((element) => { return (data.id == element.sectionTypeID && (element.sectionMeta.main == true)) }) == -1


        )
      })
      const dialogRef = this.dialog.open(ChooseSectionComponent, {
        width: '563px',
        panelClass: 'choose-namuscript-dialog',
        data: { templates: this.sectionTemplates }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.sectionsService.getSectionById(result).subscribe((res: any) => {
          let sectionTemplate = res.data
          this.treeService.addNodeAtPlaceChange('parentList', sectionTemplate, 'end');
        })
      });
    })
  }

  showArticleData() {
    const dialogRef = this.dialog.open(ArticleDataViewComponent, {
      width: '90%',
      height: '90%',
      panelClass: 'show-article-data',
      data: {
        articleSectionsStructure: JSON.parse(JSON.stringify(this.treeService.articleSectionsStructure)),
        sectionFormGroups: this.treeService.sectionFormGroups,
        articleCitatsObj: JSON.parse(JSON.stringify(this.ydocService.figuresMap!.get('articleCitatsObj'))),
        ArticleFigures: JSON.parse(JSON.stringify(this.ydocService.figuresMap!.get('ArticleFigures')))
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.sectionsService.getSectionById(result).subscribe((res: any) => {
      })
    });

  }
}
