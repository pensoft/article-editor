import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditSectionDialogComponent } from '../../dialogs/edit-section-dialog/edit-section-dialog.component';
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
export class CdkListRecursiveComponent implements OnInit/* , AfterContentInit */ {

  @Input() articleSectionsStructure!: articleSection[];
  @Output() articleSectionsStructureChange = new EventEmitter<any>();


  @Input() startFromIndex!: number;

  @Input() parentListData!: { expandParentFunc: any, listDiv: HTMLDivElement };
  @Input() id?: string; // the id of the parent of this node
  focusedId?: string;
  mouseOn?: string;


  icons: string[] = [];
  focusIdHold?: string;
  taxonomyData: any;

  //nodesForms:{[key:string]:FormGroup} = {}
  nodesForms:FormGroup[] = []
  sectionContents: any[] = [];



  constructor(
    private formBuilderService: FormBuilderService,
    public treeService: TreeService,
    public ydocService: YdocService,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog
  ) {
    detectFocusService.getSubject().subscribe((focusedEditorId) => {
      if (focusedEditorId) {
        this.focusedId = focusedEditorId;
      }

      if (this.id !== 'parentList' && this.articleSectionsStructure.some((el) => {
        return el.sectionID == focusedEditorId;
      })) {
        this.expandParentFunc();
      }
    });


  }



  ngOnInit(): void {
    this.articleSectionsStructure.forEach((node: articleSection, index: number) => {
      //let defaultValues = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
      let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
      let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema);

      //let sectionContent = this.enrichSectionContent(node.formIOSchema, defaultValues);
      let nodeForm: FormGroup = new FormGroup({});
      this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);

      nodeForm.patchValue(defaultValues);
      nodeForm.updateValueAndValidity()
      this.nodesForms.push(nodeForm)
      this.sectionContents.push(sectionContent);
      this.treeService.sectionFormGroups[node.sectionID] = nodeForm;

      this.icons[index] = 'chevron_right';
      this.ydocService.sectionFormGroupsStructures!.observe((ymap)=>{
        let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID)
        if(!dataFromYMap||dataFromYMap.updatedFrom==this.ydocService.ydoc.guid){
          return
        } 
        Object.keys(nodeForm.controls).forEach((key) => {
          nodeForm.removeControl(key);
        })
        let defaultValues = dataFromYMap.data
        let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema);
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);
      })
    });
  }


  enrichSectionContent(schema: any, values: any) {
    if (!schema.components || !values) {
      return;
    }

    Object.keys(values).forEach((valueKey: any) => {

      const [componentName, index, key] = valueKey.split('.');
      let component = schema.components.find(({ key }: any) => key == componentName);

      if (!index || !key) {
        component['defaultValue'] = values[valueKey];
      } else {
        component['defaultValue'] = component['defaultValue'] || [];
        component['defaultValue'][+index] = component['defaultValue'][+index] || {};
        component['defaultValue'][+index][key] = values[valueKey];
      }
    });
    return schema;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.articleSectionsStructure, event.previousIndex, event.currentIndex);
    moveItemInArray(this.nodesForms, event.previousIndex, event.currentIndex);

    this.treeService.dragNodeChange(event.previousIndex, event.currentIndex, this.id!);

  }



  editNodeHandle(node: articleSection, formGroup: FormGroup, index: number) {
    try {
      //let defaultValuesFromProsmeirroNodes = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      //let defaultValues = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      let defaultValues = formGroup.value;
      
      //this.formBuilderService.buildFormGroupFromSchema(formGroup, sectionContent);
      let sectionContent = this.sectionContents[index]
      this.sectionContents[index] = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema);
      this.dialog.open(EditSectionDialogComponent, {
        width: '95%',
        height: '90%',
        data: { node: node, form: formGroup, sectionContent: sectionContent },
        disableClose: false
      }).afterClosed().subscribe(result => {
        if (result && result.compiledHtml) {
          let trackStatus = this.prosemirrorEditorsService.trackChangesMeta.trackTransactions
          this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = false
          this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
            this.prosemirrorEditorsService.trackChangesMeta
          )
          const mainDocumentSnapshot = Y.snapshot(this.ydocService.ydoc)
          let xmlFragment = this.ydocService.ydoc.getXmlFragment(node.sectionID);
          let templDiv = document.createElement('div');
          templDiv.innerHTML = result.compiledHtml
          let node1 = DOMParser.fromSchema(schema).parse(templDiv.firstChild!);
          updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
          const updatedSnapshot = Y.snapshot(this.ydocService.ydoc)
          let editorView = this.prosemirrorEditorsService
            .editorContainers[node.sectionID].editorView
          editorView.dispatch(editorView.state.tr.setMeta(ySyncPluginKey, {
            snapshot: Y.decodeSnapshot(Y.encodeSnapshot(updatedSnapshot)),
            prevSnapshot: Y.decodeSnapshot(Y.encodeSnapshot(mainDocumentSnapshot)),
            renderingFromPopUp: true,
            trackStatus
          }))
          //editorview
          this.treeService.editNodeChange(node.sectionID)
          setTimeout(() => {
            this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = trackStatus
            this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
              this.prosemirrorEditorsService.trackChangesMeta
            )
          }, 30)
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  addNodeHandle(nodeId: string) {
    this.treeService.addNodeChange(nodeId);
  }

  deleteNodeHandle(nodeId: string) {
    this.treeService.deleteNodeChange(nodeId, this.id!);
  }

  changeDisplay(div: HTMLDivElement) {
    if (div.style.display == 'none') {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
  }

  expandParentFunc = () => {
    if (this.id !== 'parentList') {
      if (this.parentListData) {
        if (this.parentListData.listDiv.style.display == 'none') {
          this.parentListData.listDiv.style.display = 'block';
        }
        this.parentListData.expandParentFunc();
      }
    }
  };

  showButtons(div: HTMLDivElement, mouseOn: boolean, borderClass: string, focusClass: string, node: any) {
    if (mouseOn) {
      this.mouseOn = node.id;
    } else {
      this.mouseOn = '';
    }
    Array.from(div.children).forEach((el: any) => {
      if (el.classList.contains('section_btn_container')) {
        Array.from(el.children).forEach((el: any) => {
          if (el.classList.contains('hidden')) {

            if (mouseOn) {
              el.style.display = 'inline';
            } else {
              el.style.display = 'none';
            }

          }
        });
      } else if (el.classList.contains('hidden')) {

        if (mouseOn) {
          el.style.display = 'inline';
        } else {
          el.style.display = 'none';
        }

      } else if (el.classList.contains('border')) {
        if (mouseOn) {
          if (this.focusedId == node.id) {
            this.focusIdHold = node.id;
            this.focusedId = '';
            /* el.classList.add(focusClass); */
          }
          el.className = `border ${borderClass} `;
          /* el.classList.remove(borderClass+"Inactive")

          el.classList.remove(borderClass)
          el.classList.add(borderClass)

          el.classList.remove(focusClass) */

          el.children.item(0).style.display = 'inline';
        } else {
          if (this.focusIdHold == node.id) {

            this.focusedId = this.focusIdHold;
            this.focusIdHold = '';

            /* el.classList.add(focusClass); */
          }
          el.className = `border ${borderClass}Inactive`;


          /* el.classList.remove(borderClass)
          el.classList.remove(borderClass)
          el.classList.add(borderClass+"Inactive") */
          el.children.item(0).style.display = 'none';
        }

      }
    });
  }


}
