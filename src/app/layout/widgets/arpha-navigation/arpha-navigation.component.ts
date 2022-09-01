import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AuthService } from '@core/services/auth.service';
import { TreeService } from 'src/app/editor/meta-data-tree/tree-service/tree.service';
import { CantOpenArticleDialogComponent } from './cant-open-article-dialog/cant-open-article-dialog.component';

@Component({
  selector: 'arpha-navigation',
  templateUrl: './arpha-navigation.component.html',
  styleUrls: ['./arpha-navigation.component.scss'],
})
export class ArphaNavigationComponent implements AfterViewInit {
  public icon = 'expand_more';
  changeText = false;

  constructor(
    private treeService: TreeService,
    public authService: AuthService,
    private router: Router,
    private serviceShare:ServiceShare,
    public sharedDialog: MatDialog,
  ) {}

  openNotAddedToEditorDialog=()=>{
    let cantOpenDialog = this.sharedDialog.open(CantOpenArticleDialogComponent)
    cantOpenDialog.afterClosed().subscribe(()=>{
      this.openDashBoard()
      this.serviceShare.resetServicesData()
    })
  }


  openDashBoard() {
    this.router.navigate(['dashboard']);
  }

  ngAfterViewInit(): void {
    this.serviceShare.openNotAddedToEditorDialog = this.openNotAddedToEditorDialog
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
