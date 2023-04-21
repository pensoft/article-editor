import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { sectionNode } from '../utils/interfaces/section-node'
import { ChangeDetectorRef, Injectable,Component, EventEmitter, Input, OnInit, Output, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { YdocService } from '../services/ydoc.service';
import { YMap } from 'yjs/dist/src/internals';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import {BehaviorSubject, Observable, interval, of} from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { TreeService } from './tree-service/tree.service';
import { treeNode } from '../utils/interfaces/treeNode';
import { articleSection } from '../utils/interfaces/articleSection';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarErrorComponentComponent } from './snack-bar-error-component/snack-bar-error-component.component';
import { FormControl } from '@angular/forms';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { debounce } from 'rxjs/operators';
import { TextSelection } from 'prosemirror-state';

@Component({
  selector: 'app-meta-data-tree',
  templateUrl: './meta-data-tree.component.html',
  styleUrls: ['./meta-data-tree.component.scss']
})

export class MetaDataTreeComponent implements OnInit,AfterViewInit{
  articleSectionsStructure ?:articleSection[]
  errorDuration = 4;

  searchForm = new FormControl('');
  @ViewChild('input', { read: ElementRef }) input?: ElementRef;

  metadataMap?:YMap<any>

  constructor(public treeService:TreeService,private ydocService:YdocService,private _snackBar: MatSnackBar, private prosemirrorEditorsService: ProsemirrorEditorsService){
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
        this.showAll(this.articleSectionsStructure);
        this.metadataMap=this.ydocService.articleStructure
        this.treeService.initTreeList(this.articleSectionsStructure!)
      }
    });
  }

  ngAfterViewInit(){
    this.setFormControlChangeListener();
  }

  showAll(sections: articleSection[]) {
    for(const section of sections) {
      section.shouldNotShow = false;
      if (section.children && section.children.length > 0) {
        this.showAll(section.children);
      }
    }
  }

  searchSections(sections: articleSection[], searchValue: string, parent?: articleSection) {
    let foundSections = [];
    for (const section of sections) {

      if (section.title && section.title.label.toLocaleLowerCase().includes(searchValue)) {
         foundSections.push(section);
         section.shouldNotShow = false;
      } else {
        section.shouldNotShow = true;
      }
      
      if (section.children && section.children.length > 0) {
        let foundChildrenSections;
        if(parent) {
          foundChildrenSections = this.searchSections(section.children, searchValue);
        } else {
          foundChildrenSections = this.searchSections(section.children, searchValue, section);
        }
        foundSections = foundSections.concat(foundChildrenSections);
      }
     
      if(section.children && section.children.find(ch => ch.shouldNotShow == false)) {
        section.shouldNotShow = false;
      }
    }
    return foundSections;
  }

  searching: boolean = false
  searchIndex: number = 0;
  searchResults?: articleSection[];

  setFormControlChangeListener() {
    this.searchForm.valueChanges.pipe(debounce(val => interval(700))).subscribe((val) => {
      if (val && val != "" && typeof val == 'string' && val.trim().length > 0) {
        const searchVal = val.toLocaleLowerCase();
        const foundSections = this.searchSections(this.articleSectionsStructure, searchVal);

        if (foundSections.length > 0) {
          this.searchResults = foundSections;
          this.searchIndex = 0;
          this.selectSection(foundSections[0]);
          this.input.nativeElement.focus();
          this.searching = true;
        } else {
          this.searching = false;
        }
      } else {
        this.showAll(this.articleSectionsStructure);
        this.searching = false;
      }
    })
  }

  selectSection(section: articleSection) {
    const editorContainer = this.prosemirrorEditorsService.editorContainers[section.sectionID];
    if (editorContainer) {
      const editorView = editorContainer.editorView;
      const { doc } = editorView.state;
      console.log(doc);
      editorView.focus();
      editorView.dispatch(editorView.state.tr.scrollIntoView().setSelection(TextSelection.create(doc, doc.firstChild.nodeSize)));
    }
  }

  selectPrevSectionFromSearch() {
    this.searchIndex--;
    const section = this.searchResults[this.searchIndex];
    this.selectSection(section);
  }

  selectNextSectionFromSearch() {
    this.searchIndex++;
    const section = this.searchResults[this.searchIndex];
    this.selectSection(section);
  }

  endSearch() {
    this.searching = false
    this.searchIndex = 0;
    this.searchResults = []
    this.searchForm.setValue('');
  }
}


