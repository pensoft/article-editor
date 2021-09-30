import { Component, OnInit } from '@angular/core';
import { TreeService } from 'src/app/editor/meta-data-tree/tree-service/tree.service';

@Component({
  selector: 'arpha-navigation',
  templateUrl: './arpha-navigation.component.html',
  styleUrls: ['./arpha-navigation.component.scss']
})
export class ArphaNavigationComponent implements OnInit {

  constructor(private treeService:TreeService) {

  }

  ngOnInit(): void {
  }

  toggleTreeDrawer(){
    this.treeService.toggleTreeDrawer.next('toggle')
  }
}
