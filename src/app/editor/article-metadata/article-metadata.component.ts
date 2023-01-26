import { DomElementSchemaRegistry } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { AuthService } from '@app/core/services/auth.service';
import { ArticleDataViewComponent } from '../dialogs/article-data-view/article-data-view.component';
import { ChooseSectionComponent } from '../dialogs/choose-section/choose-section.component';
import { FiguresDialogComponent } from '../dialogs/figures-dialog/figures-dialog.component';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { ServiceShare } from '../services/service-share.service';
import { YdocService } from '../services/ydoc.service';
import print from 'print-js'
import printJS from 'print-js';
import { ArticlesService } from '@app/core/services/articles.service';
import { HttpClient } from '@angular/common/http';
import { AllUsersService } from '@app/core/services/all-users.service';
import { ContributorsApiService } from '@app/core/services/comments/contributors-api.service';
import { TestingComponent } from '../dialogs/testing/testing.component';
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { CitableTableComponent } from '../dialogs/citable-tables-dialog/citable-table/citable-table.component';
import { CitableTablesDialogComponent } from '../dialogs/citable-tables-dialog/citable-tables-dialog.component';
import { SupplementaryFileComponent } from '../dialogs/supplementary-files/supplementary-file/supplementary-file.component';
import { SupplementaryFilesDialogComponent } from '../dialogs/supplementary-files/supplementary-files.component';
import { EndNotesDialogComponent } from '../dialogs/end-notes/end-notes.component';
import { RefsInArticleDialogComponent } from '../dialogs/refs-in-article-dialog/refs-in-article-dialog.component';

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
    private ydocService: YdocService,
    public enforcer: EnforcerService,
    private serviceShare: ServiceShare,
    private treeService: TreeService,
    private contributorsApiService:ContributorsApiService,
    private authService: AuthService) {
    this.previewMode = serviceShare.ProsemirrorEditorsService?.previewArticleMode!
  }


  ngOnInit(): void {
  }

  openTestingDialog(){
    this.dialog.open(TestingComponent, {
      //width: '100%',
      //height: '90%',
      data: {},
      disableClose: false
    }).afterClosed().subscribe(result => {

    })
  }

  openFiguresDialog() {
    //this.serviceShare.PmDialogSessionService!.createSession()
    this.dialog.open(FiguresDialogComponent, {
      //width: '100%',
      // height: '90%',
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

  openSupplementaryFilesDialog(){
    this.dialog.open(SupplementaryFilesDialogComponent, {
      //width: '100%',
      // height: '90%',
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

  openReferencesDialog(){
    this.dialog.open(RefsInArticleDialogComponent, {
      //width: '100%',
      // height: '70%',
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

  openEndNotesDialog(){
    this.dialog.open(EndNotesDialogComponent, {
      //width: '100%',
      // height: '90%',
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

  openTablesDialog() {
    //this.serviceShare.PmDialogSessionService!.createSession()
    this.dialog.open(CitableTablesDialogComponent, {
      //width: '100%',
      // height: '90%',
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
    /* let articleCitatsObj = this.ydocService.figuresMap?.get('articleCitatsObj');
    Object.keys(articleCitatsObj).forEach((sectionId) => {
      articleCitatsObj[sectionId] = {}
    })
    this.ydocService.figuresMap?.set('articleCitatsObj', articleCitatsObj); */
  }

  logData() {
    //this.ydocService.checkLastTimeUpdated();
    console.log(this.ydocService.articleData);
  }

  /* updateFigures(){
  } */

  preventAddToHistory(){
    this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin? this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = null:this.serviceShare.ProsemirrorEditorsService.ySyncPluginKeyObj.origin = this.serviceShare.ProsemirrorEditorsService.ySyncKey
  }

  getArticleCollaboratorsData(){
    /* this.serviceShare.ArticlesService.getArticleCollaboratorsData(this.ydocService.roomName).subscribe((data)=>{
    }) */
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
      if(result){
        this.serviceShare.ProsemirrorEditorsService.spinSpinner()
        this.sectionsService.getSectionById(result).subscribe((res: any) => {
          let sectionTemplate = res.data
          this.treeService.addNodeAtPlaceChange('parentList', sectionTemplate, 'end');
          this.serviceShare.ProsemirrorEditorsService.stopSpinner()
        })
      }
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
      /* this.sectionsService.getSectionById(result).subscribe((res: any) => {
      }) */
    });

  }
}
