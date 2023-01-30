import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AuthService } from '@core/services/auth.service';
import { TreeService } from 'src/app/editor/meta-data-tree/tree-service/tree.service';
import { CantOpenArticleDialogComponent } from './cant-open-article-dialog/cant-open-article-dialog.component';
import { UsersRoleIsChangedComponent } from './users-role-is-changed/users-role-is-changed.component';

@Component({
  selector: 'arpha-navigation',
  templateUrl: './arpha-navigation.component.html',
  styleUrls: ['./arpha-navigation.component.scss'],
})
export class ArphaNavigationComponent implements AfterViewInit {
  public icon = 'expand_more';
  changeText = false;
  mobileVersion:boolean = false;
  constructor(
    private treeService: TreeService,
    public authService: AuthService,
    public router: Router,
    private serviceShare:ServiceShare,
    public sharedDialog: MatDialog,
    public enforcer:EnforcerService,
  ) {

  }

  openNotAddedToEditorDialog=()=>{
    let cantOpenDialog = this.sharedDialog.open(CantOpenArticleDialogComponent)
    cantOpenDialog.afterClosed().subscribe(()=>{
      this.openDashBoard()
      this.serviceShare.resetServicesData()
    })
    this.serviceShare.ProsemirrorEditorsService.mobileVersionSubject.subscribe((data) => {
      // data == true => mobule version
      this.mobileVersion = data
    })
  }
  openchooseDialog() {
    console.log(this.router);
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    this.router.navigate(['dashboard']);
    this.serviceShare.shouldOpenNewArticleDialog = true;
  }
  openNotifyUserAccessChangeDialog = (oldAccess:string,newAccess:string)=>{
    let cantOpenDialog = this.sharedDialog.open(UsersRoleIsChangedComponent,{data:{oldAccess,newAccess}})
  }


  openDashBoard() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    this.router.navigate(['dashboard']);
  }

  ngAfterViewInit(): void {
    this.serviceShare.openNotAddedToEditorDialog = this.openNotAddedToEditorDialog
    this.serviceShare.openNotifyUserAccessChangeDialog = this.openNotifyUserAccessChangeDialog
    this.mobileVersion = this.serviceShare.ProsemirrorEditorsService.mobileVersion;
  }

  toggleTreeDrawer() {
    this.treeService.toggleTreeDrawer.next('toggle');
  }

  isLogIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public changeIcon(expand_less: string) {
    if (this.icon === 'expand_more') {
      this.icon = 'expand_less';
    } else {
      this.icon = 'expand_more';
    }
  }
}
