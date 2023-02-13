import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { CslService } from '@app/layout/pages/library/lib-service/csl.service';
import { EditorsRefsManagerService } from '@app/layout/pages/library/lib-service/editors-refs-manager.service';
import { ReferencePluginService } from '@app/layout/pages/library/lib-service/reference-plugin.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
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
import { FormBuilderService } from './form-builder.service';
import { MenuService } from './menu.service';
import { PmDialogSessionService } from './pm-dialog-session.service';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { YdocService } from './ydoc.service';
import { AuthService } from '@app/core/services/auth.service'
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { CasbinGlobalObjectsService } from '@app/casbin/services/casbin-global-objects.service';
import { NotificationsService } from '@app/layout/widgets/arpha-navigation/notifications/notifications.service';
import { CitableElementsService } from './citable-elements.service';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import { JatsErrorsDialogComponent } from '../dialogs/jats-errors-dialog/jats-errors-dialog.component';
import { CitableElementsContextMenuService } from '../utils/citable-elements-context-menu/citable-elements-context-menu.service';
import { ChangesSectionComponent } from '../changes-section/changes-section.component';
import { CollaboratorsService } from '../dialogs/add-contributors-dialog/collaborators.service';
import { TaxonService } from '../taxons/taxon.service';
@Injectable({
  providedIn: 'root'
})
export class ServiceShare {

  articleLayouts:any

  TaxonService?:TaxonService
  CollaboratorsService?:CollaboratorsService
  ChangesSectionComponent?:ChangesSectionComponent
  CitableElementsService?:CitableElementsService
  CitableElementsContextMenuService?:CitableElementsContextMenuService
  ReferencePluginService?:ReferencePluginService
  CslService?:CslService
  ProsemirrorEditorsService?:ProsemirrorEditorsService
  YdocService?:YdocService
  TreeService?:TreeService
  CommentsService?:CommentsService
  DetectFocusService?:DetectFocusService
  TrackChangesService?:TrackChangesService
  ArticleSectionsService?:ArticleSectionsService
  ArticlesService?:ArticlesService
  YjsHistoryService?:YjsHistoryService
  PmDialogSessionService?:PmDialogSessionService
  MenuService?:MenuService
  EditorsRefsManagerService?:EditorsRefsManagerService
  FormBuilderService?:FormBuilderService
  RefsApiService?:RefsApiService
  AuthService?:AuthService
  EnforcerService?:EnforcerService
  CasbinGlobalObjectsService?:CasbinGlobalObjectsService
  NotificationsService?:NotificationsService

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public httpClient:HttpClient,
    private _snackBar: MatSnackBar
    ) {

  }

  globalObj:{[key:string]:any} = {}

  addDataToGlobalObj(dataKey:string,data:any){
    this.globalObj[dataKey] = data
  }

  resolversData:{[key:string]:any} = {}

  addResolverData(resolveKey:string,data:any){
    this.resolversData[resolveKey] = data;
  }

  logData(){

    this.ProsemirrorEditorsService!.transactionCount = 0;
  }

  makeFlat?:()=>void

  resetServicesData (){
    this.ProsemirrorEditorsService?.resetProsemirrorEditors();
    this.YdocService?.resetYdoc();
    this.TreeService?.resetTreeData();
    this.CommentsService?.resetCommentsService();
    this.DetectFocusService?.resetDetectFocusService();
    this.TrackChangesService?.resetTrackChangesService();
    this.YjsHistoryService?.resetHistoryData();
    this.resolversData = {}
  }

  updateCitableElementsViews(){
    this.YjsHistoryService.captureBigOperation();
    this.CitableElementsService.updateOnlyElementsViews();
  }

  updateCitableElementsViewsAndCites(){
    this.YjsHistoryService.captureBigOperation()
    this.CitableElementsService.updateElementsAndElementsCitations();
  }

  shouldOpenNewArticleDialog = false;

  createNewArticle(fromToolBar?:boolean){
    this.ProsemirrorEditorsService.spinSpinner()
    this.ArticleSectionsService!.getAllLayouts().subscribe((articleLayouts: any) => {
      this.articleLayouts = articleLayouts
      const dialogRef = this.dialog.open(ChooseManuscriptDialogComponent, {
        width: '563px',
        // height: '657px',
        panelClass:'choose-namuscript-dialog',
        data: { layouts: articleLayouts }
      });
      this.ProsemirrorEditorsService.stopSpinner()
      dialogRef.afterClosed().subscribe(result => {
        if(!result) return ;
        this.AuthService.getUserInfo().subscribe((userData)=>{
          let selectedLayout = (this.articleLayouts.data as Array<any>).find((layout: any) => {
            return layout.id == result
          }).template
          let articleStructure: articleSection[] = []
          //let filteredSections = selectedLayout.sections.filter((section: any) => { return section.type == 0 });

          this.ArticlesService!.createArticle('Untitled',+result).subscribe((createArticleRes:any)=>{
            this.resetServicesData();
            this.YdocService!.setArticleData(createArticleRes.data)
            this.router.navigate([createArticleRes.data.uuid])
            this.YdocService.newArticleIsCreated(userData,createArticleRes.data.uuid)
            selectedLayout.sections = selectedLayout.sections.filter(x=>x.name!='Citable Elements Schemas');
            selectedLayout.sections.forEach((section: any) => {
              if(section.settings&&section.settings.main_section == true){
                let newSection = renderSectionFunc(section,articleStructure,this.YdocService!.ydoc,'end');
              }
            })
            this.YdocService!.articleStructureFromBackend = articleStructure;
          })
        })
      });
    })
  }

  openNotifyUserAccessChangeDialog:(oldAccess:string,newAccess:string)=>void
  openNotAddedToEditorDialog:()=>void
  shareSelf(serviceName:string,serviceInstance:any){
    //@ts-ignore
    this[serviceName] = serviceInstance
  }

  openSnackBar(message:string,action:string,obsFnc:()=>void,durationInSec:number){
    let snackBarRef = this._snackBar.open(message, action,{
      duration: durationInSec * 1000,
    });
    snackBarRef.onAction().subscribe(obsFnc);
  }

  openJatsErrorsDialog(errors:any[]){
    this.dialog.open(JatsErrorsDialogComponent,{
      data: {errors},
    })
  }
}
