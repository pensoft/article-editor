import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
import { DetectFocusService } from '../../utils/detectFocusPlugin/detect-focus.service';
import { articleSection } from '../../utils/interfaces/articleSection';
import { TreeService } from '../tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';
//@ts-ignore
import { updateYFragment } from '../../../y-prosemirror-src/plugins/sync-plugin.js'
import { schema } from '../../utils/Schema/index';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormGroup } from '@angular/forms';
import { YMap } from 'yjs/dist/src/internals';
//@ts-ignore
import * as Y from 'yjs'
//@ts-ignore
import { ySyncPluginKey } from '../../../y-prosemirror-src/plugins/keys.js';

@Component({
  selector: 'app-cdk-list-recursive',
  templateUrl: './cdk-list-recursive.component.html',
  styleUrls: ['./cdk-list-recursive.component.scss']
})
export class CdkListRecursiveComponent implements OnInit {

  @Input() articleSectionsStructure!: articleSection[];
  @Output() articleSectionsStructureChange = new EventEmitter<any>();

  @Input() nestedList!: boolean;

  @Input() listData!: { expandParentFunc: any, listDiv: HTMLDivElement };
  @Input() listParentId?: string; // the id of the parent of this node
  focusedId?: string;
  mouseOn?: string;

  sectionsFormGroups:{[key:string]:FormGroup} = {};

  focusIdHold?: string;
  taxonomyData: any;

  //nodesForms:{[key:string]:FormGroup} = {}

  constructor(
    private formBuilderService: FormBuilderService,
    public treeService: TreeService,
    public ydocService: YdocService,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.sectionsFormGroups = this.treeService.sectionFormGroups
    this.articleSectionsStructure.forEach((node: articleSection, index: number) => {
      //let defaultValues = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
      let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
      let sectionContent = defaultValues? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema,node.sectionID):node.formIOSchema;

      let nodeForm: FormGroup = new FormGroup({});
      this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);

      nodeForm.patchValue(defaultValues);
      nodeForm.updateValueAndValidity()
      this.treeService.sectionFormGroups[node.sectionID] = nodeForm;


      this.ydocService.sectionFormGroupsStructures!.observe((ymap)=>{
        let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID)
        if(!dataFromYMap||dataFromYMap.updatedFrom==this.ydocService.ydoc.guid){
          return
        }
        Object.keys(nodeForm.controls).forEach((key) => {
          nodeForm.removeControl(key);
        })
        let defaultValues = dataFromYMap.data
        let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema,node.sectionID);
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);
      })
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.articleSectionsStructure, event.previousIndex, event.currentIndex);
    this.treeService.dragNodeChange(event.previousIndex, event.currentIndex, this.listParentId!);
  }

}
