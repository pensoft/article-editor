import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TreeService } from 'src/app/editor/meta-data-tree/tree-service/tree.service';

@Component({
  selector: 'arpha-navigation',
  templateUrl: './arpha-navigation.component.html',
  styleUrls: [ './arpha-navigation.component.scss' ]
})
export class ArphaNavigationComponent implements OnInit {
  public icon = 'expand_more';

  constructor(
    private treeService: TreeService,
    public authService: AuthService,
    private router: Router,) {

  }

  openDashBoard(){
    this.router.navigate(['dashboard'])
  }

  ngOnInit(): void {

  }

  toggleTreeDrawer() {
    this.treeService.toggleTreeDrawer.next('toggle');
  }


  isLogIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public changeIcon(expand_less: string ){
    if (this.icon === 'expand_more') {
      this.icon = 'expand_less';
  } else {
      this.icon = 'expand_more'
  }
}
}
