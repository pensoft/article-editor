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

@Component({
  selector: 'app-meta-data-tree',
  templateUrl: './meta-data-tree.component.html',
  styleUrls: ['./meta-data-tree.component.scss']
})

export class MetaDataTreeComponent implements OnInit,AfterViewInit{
  articleSectionsStructure ?:articleSection[]
  
  
  metadataMap?:YMap<any>
  constructor(public treeService:TreeService,private ydocService:YdocService){
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


