import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { sectionNode } from '../utils/interfaces/section-node'
import { ChangeDetectorRef, Injectable,Component, EventEmitter, Input, OnInit, Output, AfterViewInit } from '@angular/core';
import { YdocService } from '../services/ydoc.service';
import { YMap } from 'yjs/dist/src/internals';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import {BehaviorSubject, Observable, of} from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { TreeService } from './tree-service/tree.service';
import { treeNode } from '../utils/interfaces/treeNode';
import { articleSection } from '../utils/interfaces/articleSection';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarErrorComponentComponent } from './snack-bar-error-component/snack-bar-error-component.component';

@Component({
  selector: 'app-meta-data-tree',
  templateUrl: './meta-data-tree.component.html',
  styleUrls: ['./meta-data-tree.component.scss']
})

export class MetaDataTreeComponent implements OnInit,AfterViewInit{
  articleSectionsStructure ?:articleSection[]
  errorDuration = 4;
  metadataMap?:YMap<any>
  constructor(public treeService:TreeService,private ydocService:YdocService,private _snackBar: MatSnackBar){
    this.treeService.errorSnackbarSubject.subscribe((data)=>{
      this._snackBar.openFromComponent(SnackBarErrorComponentComponent, {
        panelClass:'snackbar-error',
        duration: this.errorDuration * 1000,

      });
    })
  }
  ngOnInit(){
    if (this.ydocService.editorIsBuild) {
      this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
      this.metadataMap=this.ydocService.articleStructure
      this.treeService.initTreeList(this.articleSectionsStructure!)
    }
    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
      this.metadataMap=this.ydocService.articleStructure
      this.treeService.initTreeList(this.articleSectionsStructure!)

    }
    });
  }

  ngAfterViewInit(){

  }
}


