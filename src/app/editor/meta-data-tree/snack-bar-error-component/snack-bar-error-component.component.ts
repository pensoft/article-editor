import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TreeService } from '../tree-service/tree.service';

@Component({
  selector: 'app-snack-bar-error-component',
  templateUrl: './snack-bar-error-component.component.html',
  styleUrls: ['./snack-bar-error-component.component.scss']
})
export class SnackBarErrorComponentComponent implements OnInit,AfterViewInit {

  constructor(private treeService:TreeService) { }

  errorObj?:any[];

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
      this.errorObj = this.treeService.canDropBool;
  }
}
