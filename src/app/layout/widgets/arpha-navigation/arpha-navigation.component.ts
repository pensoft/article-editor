import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AuthService } from '@core/services/auth.service';
import { TreeService } from 'src/app/editor/meta-data-tree/tree-service/tree.service';
import { CantOpenArticleDialogComponent } from './cant-open-article-dialog/cant-open-article-dialog.component';
import { UsersRoleIsChangedComponent } from './users-role-is-changed/users-role-is-changed.component';
import { TranslateService } from '@ngx-translate/core';
import Packages from '../../../../../package.json';

@Component({
  selector: 'arpha-navigation',
  templateUrl: './arpha-navigation.component.html',
  styleUrls: ['./arpha-navigation.component.scss'],
})
export class ArphaNavigationComponent implements AfterViewInit {
  version = `${Packages.version}`;

  changeText = false;
  mobileVersion: boolean = false;
  languages = ['en', 'bg', 'de'];
  constructor(
    private treeService: TreeService,
    public authService: AuthService,
    public router: Router,
    private serviceShare: ServiceShare,
    public sharedDialog: MatDialog,
    public enforcer: EnforcerService,
    private translate: TranslateService,
    @Inject('AUTH_SERVICE') private authServiceUrl: string,
  ) {

  }

  openNotAddedToEditorDialog = () => {
    let cantOpenDialog = this.sharedDialog.open(CantOpenArticleDialogComponent)
    cantOpenDialog.afterClosed().subscribe(() => {
      this.openDashBoard()
      this.serviceShare.resetServicesData()
    })
    this.serviceShare.ProsemirrorEditorsService.mobileVersionSubject.subscribe((data) => {
      // data == true => mobule version
      this.mobileVersion = data
    })
  }

  openchooseDialog() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    this.router.navigate(['dashboard']);
    this.serviceShare.shouldOpenNewArticleDialog = true;
  }

  openNotifyUserAccessChangeDialog = (oldAccess: string, newAccess: string) => {
    let cantOpenDialog = this.sharedDialog.open(UsersRoleIsChangedComponent, { data: { oldAccess, newAccess } })
  }

  setLanguage(lang: string) {
    this.translate.use(lang)
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

  isLogIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    const returnUrl = `${window.location.origin}/logout`;
    window.location.href = `${this.authServiceUrl}/logout?return_uri=${encodeURIComponent(returnUrl)}`;
    //this.auth.invalidateToken();
    //document.location.reload();
  }
}
