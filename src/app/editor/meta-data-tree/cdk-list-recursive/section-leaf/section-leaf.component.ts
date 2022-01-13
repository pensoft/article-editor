import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditSectionDialogComponent } from '../../../dialogs/edit-section-dialog/edit-section-dialog.component';
import { ProsemirrorEditorsService } from '../../../services/prosemirror-editors.service';
import { YdocService } from '../../../services/ydoc.service';
import { DetectFocusService } from '../../../utils/detectFocusPlugin/detect-focus.service';
import { articleSection } from '../../../utils/interfaces/articleSection';
import { TreeService } from '../../tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';
//@ts-ignore
import { updateYFragment } from '../../../../y-prosemirror-src/plugins/sync-plugin.js'
import { schema } from '../../../utils/Schema/index';
import { FormBuilderService } from '../../../services/form-builder.service';
import { FormGroup } from '@angular/forms';
import { YMap } from 'yjs/dist/src/internals';
//@ts-ignore
import * as Y from 'yjs'
//@ts-ignore
import { ySyncPluginKey } from '../../../../y-prosemirror-src/plugins/keys.js';
import { E, I } from '@angular/cdk/keycodes';
import { AskBeforeDeleteComponent } from '@app/editor/dialogs/ask-before-delete/ask-before-delete.component';

@Component({
  selector: 'app-section-leaf',
  templateUrl: './section-leaf.component.html',
  styleUrls: ['./section-leaf.component.scss']
})
export class SectionLeafComponent implements OnInit {

  @Input() parentListData!: { expandParentFunc: any, listDiv: HTMLDivElement };
  @Input() parentId?: string; // the id of the parent of this node
  focusedId?: string;
  mouseOn?: string;


  expandIcon?: string;
  focusIdHold?: string;
  taxonomyData: any;

  //nodesForms:{[key:string]:FormGroup} = {}
  @Input() node!: articleSection;
  @Output() nodeChange = new EventEmitter<any>();

  @Input() nodeFormGroup!: FormGroup;
  @Output() nodeFormGroupChange = new EventEmitter<FormGroup>();

  @Input() lastNestedChild!: boolean;
  @Input() nestedNode!: boolean;

  @Input() isComplex!: boolean;

  @Input() sectionsFormGroupsRef!:{[key:string]:FormGroup}
  @Output() sectionsFormGroupsRefChange = new EventEmitter<FormGroup>();

  constructor(
    private formBuilderService: FormBuilderService,
    public treeService: TreeService,
    public ydocService: YdocService,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog) {
    detectFocusService.getSubject().subscribe((focusedEditorId:any) => {
      if (focusedEditorId) {
        this.focusedId = focusedEditorId;
      }

      if (this.parentId !== 'parentList' && this.node.sectionID == this.focusedId){
        this.expandParentFunc();
      }
    });
  }

  ngOnInit(){
    this.expandIcon = 'chevron_right';
  }

  oldTextValue ?:string
  checkTextInput(element:HTMLDivElement,maxlength:number){
    console.log(element.textContent);
    if(element.textContent?.trim().length! > maxlength){
      element.innerHTML = this.oldTextValue!
    }if(element.textContent?.trim().length! == maxlength){
      this.oldTextValue = element.textContent!.trim();
    }
  }

  editNodeHandle(node: articleSection, formGroup: FormGroup) {
    try {
      //let defaultValuesFromProsmeirroNodes = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      //let defaultValues = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]

      let defaultValues = formGroup.value;

      //this.formBuilderService.buildFormGroupFromSchema(formGroup, sectionContent);
      let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema,node.sectionID);
      node.formIOSchema = sectionContent
      this.dialog.open(EditSectionDialogComponent, {
        width: '95%',
        height: '90%',
        data: { node: node, form: formGroup, sectionContent },
        disableClose: false
      }).afterClosed().subscribe(result => {
        if (result && result.compiledHtml) {
          this.treeService.editNodeChange(node.sectionID)

          let trackStatus = this.prosemirrorEditorsService.trackChangesMeta.trackTransactions
          this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = false
          this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
            this.prosemirrorEditorsService.trackChangesMeta
          )
          let xmlFragment = this.ydocService.ydoc.getXmlFragment(node.sectionID);
          let templDiv = document.createElement('div');
          templDiv.innerHTML = result.compiledHtml
          let node1 = DOMParser.fromSchema(schema).parse(templDiv.firstChild!);
          if(trackStatus){
            const mainDocumentSnapshot = Y.snapshot(this.ydocService.ydoc)
            updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
            const updatedSnapshot = Y.snapshot(this.ydocService.ydoc)
            let editorView = this.prosemirrorEditorsService
            .editorContainers[node.sectionID].editorView
            editorView.dispatch(editorView.state.tr.setMeta(ySyncPluginKey, {
              snapshot: Y.decodeSnapshot(Y.encodeSnapshot(updatedSnapshot)),
              prevSnapshot: Y.decodeSnapshot(Y.encodeSnapshot(mainDocumentSnapshot)),
              renderingFromPopUp: true,
              trackStatus:true,
              userInfo:this.prosemirrorEditorsService.userInfo,
            }))
          }else{
            updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
          }
          //editorview
          setTimeout(() => {
            this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = trackStatus
            this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
              this.prosemirrorEditorsService.trackChangesMeta
            )
            this.prosemirrorEditorsService.citatEditingSubject.next({action:'deleteCitatsFromDocument'})
          }, 30)
        }else{
          setTimeout(() => {
            this.prosemirrorEditorsService.citatEditingSubject.next({action:'clearDeletedCitatsFromPopup'})
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
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent,{
      data: { sectionName: this.treeService.findNodeById(nodeId)?.title.titleContent },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data:any)=>{
      if(data){
        this.treeService.deleteNodeChange(nodeId, this.parentId!);
      }
    })
  }

  oldZIndex ?: string
  makeEditable(element:HTMLDivElement,event:Event,parentNode:any){
    console.log(event);
    if(event.type == 'blur'){
      element.setAttribute('contenteditable','false');
      console.log('should save',element.textContent);
      (parentNode as HTMLDivElement).style.zIndex = this.oldZIndex!;

    }else if (event.type == 'click'){
      this.oldZIndex = (parentNode as HTMLDivElement).style.zIndex!
      element.setAttribute('contenteditable','true');
      (parentNode as HTMLDivElement).style.zIndex = '5';
      element.focus()
    }

  }

  changeDisplay(div: HTMLDivElement) {
    if (div.style.display == 'none') {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
  }

  expandParentFunc = () => {
    if (this.parentId !== 'parentList') {
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
