import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
import { DetectFocusService } from '../../utils/detectFocusPlugin/detect-focus.service';
import { articleSection } from '../../utils/interfaces/articleSection';
import { TreeService } from '../tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';
//@ts-ignore
import { updateYFragment } from '../../../y-prosemirror-src/plugins/sync-plugin.js'
import { FormBuilderService } from '../../services/form-builder.service';
import { FormGroup } from '@angular/forms';
import { YMap } from 'yjs/dist/src/internals';
//@ts-ignore
import * as Y from 'yjs'
//@ts-ignore
import { ySyncPluginKey } from '../../../y-prosemirror-src/plugins/keys.js';
import { checkCompatibilitySection } from '@app/editor/utils/articleBasicStructure';
import { ArticlesService } from '@app/core/services/articles.service';
import { P } from '@angular/cdk/keycodes';
import { SectionLeafComponent } from './section-leaf/section-leaf.component';

@Component({
  selector: 'app-cdk-list-recursive',
  templateUrl: './cdk-list-recursive.component.html',
  styleUrls: ['./cdk-list-recursive.component.scss']
})
export class CdkListRecursiveComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() articleSectionsStructure!: any[];
  @Output() articleSectionsStructureChange = new EventEmitter<any>();

  @Input() nestedList!: boolean;
  @Input() firstNested!: boolean;
  @Input() searching!: boolean;

  @Input() listData!: { expandParentFunc: any, listDiv: HTMLDivElement ,listinstance:SectionLeafComponent };
  @Input() listParentId?: string; // the id of the parent of this node
  focusedId?: string;
  mouseOn?: string;
  @ViewChild('dragDropList', { read: CdkDropList }) dragDropList?: CdkDropList;

  sectionsFormGroups: { [key: string]: FormGroup } = {};
  connectedTo: CdkDropList[]

  focusIdHold?: string;
  taxonomyData: any;

  //nodesForms:{[key:string]:FormGroup} = {}

  constructor(
    private formBuilderService: FormBuilderService,
    public treeService: TreeService,
    public ydocService: YdocService,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog,
    public changeDetectorRef: ChangeDetectorRef
  ) {

    this.connectedTo = this.treeService.dropListRefs.cdkRefs
  }

  ngAfterViewInit(): void {
    if (this.dragDropList) {
      this.treeService.registerDropListRef(this.dragDropList._dropListRef,this.dragDropList, this.listParentId);
    }
  }

  ngOnInit(): void {
    this.treeService.connectionChangeSubject.subscribe((bool) => {
      this.connectedTo = this.treeService.dropListRefs.cdkRefs
      if (this.dragDropList) {
        this.dragDropList._dropListRef.connectedTo(this.treeService.dropListRefs.refs)
      }
    })
    this.connectedTo = this.treeService.dropListRefs.cdkRefs
    this.treeService.registerConnection(this.listParentId!)
    this.sectionsFormGroups = this.treeService.sectionFormGroups
    this.articleSectionsStructure.forEach((node: articleSection, index: number) => {
      //let defaultValues = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
      let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
      let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID,node) : node.formIOSchema;

      let nodeForm: FormGroup = new FormGroup({});
      this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent, node);

      nodeForm.patchValue(defaultValues);
      nodeForm.updateValueAndValidity()
      this.treeService.sectionFormGroups[node.sectionID] = nodeForm;
      this.treeService.setTitleListener(node)


      this.ydocService.sectionFormGroupsStructures!.observe((ymap) => {
        let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID)
        if (!dataFromYMap || dataFromYMap.updatedFrom == this.ydocService.ydoc.guid) {
          return
        }
        Object.keys(nodeForm.controls).forEach((key) => {
          nodeForm.removeControl(key);
        })
        let defaultValues = dataFromYMap.data
        let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID,node);
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent, node);
        this.treeService.setTitleListener(node)
      })
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (!this.treeService.canDropBool[0]) {
      this.treeService.errorSnackbarSubject.next(true);
      return
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.treeService.dragNodeChange(event.previousIndex, event.currentIndex, event.previousContainer.id, event.container.id, event.item.data.node);
    } else {
      // copy data and moe the items the copy then cehck if the list level is grater than 4 if it is wi dont perform the drop instead wi display an error

      let articleDataCopy = JSON.parse(JSON.stringify(this.treeService.articleSectionsStructure))
      let prevContNewRef: any[]
      let newContNewRef: any[]

      if (this.listParentId == 'parentList') {
        newContNewRef = articleDataCopy;
      }

      if (event.previousContainer.id == 'parentList') {
        prevContNewRef = articleDataCopy;
      }

      let findReferences = (container: any) => {
        container.forEach((el: any) => {
          if (el.sectionID == event.previousContainer.id) {
            prevContNewRef = el.children
          }
          if (el.sectionID == event.container.id) {
            newContNewRef = el.children
          }
          if (el.children && el.children.length > 0) {
            findReferences(el.children)
          }
        })
      }

      findReferences(articleDataCopy);
      //@ts-ignore
      transferArrayItem(prevContNewRef, newContNewRef, event.previousIndex, event.currentIndex);

      let treeNewLevel = 0;
      let countLevel = (num: number, container: any) => {
        let newNum = num + 1
        if (newNum > treeNewLevel) {
          treeNewLevel = newNum;
        }
        container.forEach((el: articleSection) => {
          if (el.type == 'complex') {
            countLevel(newNum, el.children);
          }
        })
      }

      countLevel(0, articleDataCopy);
      if (treeNewLevel >= 5 || !checkCompatibilitySection(this.treeService.findNodeById(event.container.id)?.compatibility, event.item.data.node)) {
        this.treeService.errorSnackbarSubject.next(true);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
        this.treeService.dragNodeChange(event.previousIndex, event.currentIndex, event.previousContainer.id, event.container.id, event.item.data.node);
      }
    }
  }

  ngOnDestroy(): void {
    this.treeService.unregisterDropListRef(this.listParentId!);
  }

}
