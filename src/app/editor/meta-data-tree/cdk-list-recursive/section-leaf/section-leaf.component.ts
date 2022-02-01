import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
import { ArticlesService } from '@app/core/services/articles.service';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'app-section-leaf',
  templateUrl: './section-leaf.component.html',
  styleUrls: ['./section-leaf.component.scss']
})
export class SectionLeafComponent implements OnInit, AfterViewInit {

  @Input() parentListData!: { expandParentFunc: any, listDiv: HTMLDivElement };
  @Input() parentId?: string; // the id of the parent of this node
  focusedId?: string;
  mouseOn?: string;

  canDropBool?: boolean[]

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

  @Input() sectionsFormGroupsRef!: { [key: string]: FormGroup }
  @Output() sectionsFormGroupsRefChange = new EventEmitter<FormGroup>();


  @ViewChild('cdkDragSection', { read: ElementRef }) dragSection?: ElementRef;

  constructor(
    private formBuilderService: FormBuilderService,
    public treeService: TreeService,
    public ydocService: YdocService,
    private serviceShare: ServiceShare,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public dialog: MatDialog) {
    detectFocusService.getSubject().subscribe((focusedEditorId: any) => {
      if (focusedEditorId) {
        this.focusedId = focusedEditorId;
      }

      if (this.parentId !== 'parentList' && this.node.sectionID == this.focusedId) {
        (this.dragSection!.nativeElement as HTMLDivElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
        this.expandParentFunc();
      }
    });
  }

  ngAfterViewInit(): void {

  }

  ngOnInit() {
    this.expandIcon = 'chevron_right';
    this.canDropBool = this.treeService.canDropBool;
  }

  oldTextValue?: string

  checkTextInput(element: HTMLDivElement, maxlength: number, event: Event) {
    if (element.textContent?.trim().length == 0) {
      element.innerHTML = "<br>"
      return
    }
    if (/<\/?[a-z][\s\S]*>/i.test(element.innerHTML)) {
      element.innerHTML = `${element.textContent!}`;
    }
    if (element.textContent?.trim().length! > maxlength && this.oldTextValue) {
      element.innerHTML = `${this.oldTextValue}`
    } else if (element.textContent?.trim().length! == maxlength) {
      this.oldTextValue = element.textContent!.trim();
    }
    //@ts-ignore
    let updatemeta = this.treeService.sectionFormGroups[this.node.sectionID].titleUpdateMeta as { time: number, updatedFrom: string };

    let now = Date.now()
    let controlValue = this.nodeFormGroup.get('sectionTreeTitle')?.value;


    if (controlValue !== element.textContent?.trim()) {
      if (now > updatemeta.time) {
        updatemeta.time = now;
        this.treeService.labelupdateLocalMeta[this.node.sectionID].time = now;
        updatemeta.updatedFrom = this.treeService.labelupdateLocalMeta[this.node.sectionID].updatedFrom;
        this.nodeFormGroup.get('sectionTreeTitle')?.patchValue(element.textContent?.trim());
        this.prosemirrorEditorsService.dispatchEmptyTransaction()
      }

    }
    /* if(updatemeta.time&&updatemeta.time<now){
      this.nodeFormGroup.get('sectionTreeTitle')?.patchValue(element.textContent)
      updatemeta.time = now;
      updatemeta.updatedFrom = this.labelupdateLocalMeta.updatedFrom;
    }else{
      this.nodeFormGroup.get('sectionTreeTitle')?.patchValue(element.textContent)
      updatemeta.time = now;
      updatemeta.updatedFrom = this.labelupdateLocalMeta.updatedFrom;
    } */

  }

  editNodeHandle(node: articleSection, formGroup: FormGroup) {
    try {
      //let defaultValuesFromProsmeirroNodes = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]
      //let defaultValues = this.prosemirrorEditorsService.defaultValuesObj[node.sectionID]

      let defaultValues = formGroup.value;

      //this.formBuilderService.buildFormGroupFromSchema(formGroup, sectionContent);
      let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID);

      let updateYdoc = new Y.Doc();
      let maindocstate = Y.encodeStateAsUpdate(this.ydocService.ydoc)
      Y.applyUpdate(updateYdoc,maindocstate)
       let updateXmlFragment = updateYdoc.getXmlFragment(node.sectionID);

      let xmlToCopyFrom = this.ydocService.ydoc.getXmlFragment(node.sectionID);
      /*updateXmlFragment.insert(0, xmlToCopyFrom.toArray().map((item: any) => item instanceof Y.AbstractType ? item.clone() : item)); */

      let originUpdates: any[] = [];
      let registerUpdateFunc = (update: any) => {
        console.log('updating');
        originUpdates.push(update)
      }
      this.ydocService.ydoc.on('update',registerUpdateFunc )

      node.formIOSchema = sectionContent
      this.dialog.open(EditSectionDialogComponent, {
        width: '95%',
        height: '90%',
        data: { node: node, form: formGroup, sectionContent },
        disableClose: false
      }).afterClosed().subscribe(result => {
        if (result && result.compiledHtml) {
          this.treeService.editNodeChange(node.sectionID)

          let copyOriginUpdatesBeforeReplace = [...originUpdates]
          let trackStatus = this.prosemirrorEditorsService.trackChangesMeta.trackTransactions
          this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = false
          this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
            this.prosemirrorEditorsService.trackChangesMeta
          )
          let xmlFragment = this.ydocService.ydoc.getXmlFragment(node.sectionID);
          let templDiv = document.createElement('div');
          templDiv.innerHTML = result.compiledHtml
          let node1 = DOMParser.fromSchema(schema).parse(templDiv.firstChild!);
          if (trackStatus) {
            const snapshotFromBackGround = Y.snapshot(this.ydocService.ydoc);
            updateYFragment(updateYdoc, updateXmlFragment, node1, new Map());
            const updatedSnapshot = Y.snapshot(this.ydocService.ydoc)
            let editorView = this.prosemirrorEditorsService
              .editorContainers[node.sectionID].editorView
            copyOriginUpdatesBeforeReplace.forEach((update) => {
              Y.applyUpdate(updateYdoc,update);
            })
            let xmlElements = xmlToCopyFrom.toArray().length

            let maindocstate = Y.encodeStateAsUpdate(updateYdoc)
            Y.applyUpdate(this.ydocService.ydoc,maindocstate)
            //xmlToCopyFrom.delete(0,xmlElements)
            //xmlToCopyFrom.insert(0, updateXmlFragment.toArray().map((item: any) => item instanceof Y.AbstractType ? item.clone() : item));

            /* editorView.dispatch(editorView.state.tr.setMeta(ySyncPluginKey, {
              snapshot: Y.decodeSnapshot(Y.encodeSnapshot(updatedSnapshot)),
              prevSnapshot: Y.decodeSnapshot(Y.encodeSnapshot(snapshotFromBackGround)),
              renderingFromPopUp: true,
              trackStatus: true,
              userInfo: this.prosemirrorEditorsService.userInfo,
            })) */
          } else {
            updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
          }
          //editorview
          setTimeout(() => {
            this.prosemirrorEditorsService.trackChangesMeta.trackTransactions = trackStatus
            this.prosemirrorEditorsService.OnOffTrackingChangesShowTrackingSubject.next(
              this.prosemirrorEditorsService.trackChangesMeta
            )
            this.prosemirrorEditorsService.citatEditingSubject.next({ action: 'deleteCitatsFromDocument' })
          }, 30)
        } else {
          setTimeout(() => {
            this.prosemirrorEditorsService.citatEditingSubject.next({ action: 'clearDeletedCitatsFromPopup' })
          }, 30)
        }
      this.ydocService.ydoc.off('update',registerUpdateFunc)

      });
    } catch (e) {
      console.error(e);
    }
  }

  addNodeHandle(nodeId: string) {
    this.treeService.addNodeChange(nodeId);
  }

  deleteNodeHandle(nodeId: string) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      data: { sectionName: this.treeService.findNodeById(nodeId)?.title.label },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.treeService.deleteNodeChange(nodeId, this.parentId!);
      }
    })
  }

  oldZIndex?: string
  scrolledToView?: boolean
  makeEditable(element: HTMLDivElement, event: Event, parentNode: any, node: articleSection) {
    if (element.textContent?.trim().length == 0) {
      element.innerHTML = "<br>"
      return
    }
    if (event.type == 'blur') {
      element.setAttribute('contenteditable', 'false');
      (parentNode as HTMLDivElement).style.zIndex = this.oldZIndex!;
      //this.treeService.saveNewTitleChange(node,element.textContent!);
      this.scrolledToView = false;
    } else if (event.type == 'click') {
      this.oldZIndex = (parentNode as HTMLDivElement).style.zIndex!
      element.setAttribute('contenteditable', 'true');
      (parentNode as HTMLDivElement).style.zIndex = '5';

      element.focus()
    }
  }

  scrollToProsemirror() {
    if (this.node.type == 'simple') {
      let editorContainer = this.prosemirrorEditorsService.editorContainers[this.node.sectionID];
      if (editorContainer && !this.scrolledToView) {
        let editorView = editorContainer.editorView;
        if (!editorView.hasFocus()) {
          editorView.focus()
          editorView.dispatch(editorView.state.tr.scrollIntoView());
        }
        this.scrolledToView = true;
      }

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

  showButtons(div: HTMLDivElement, mouseOn: boolean, borderClass: string, focusClass: string, node: articleSection) {
    if (mouseOn) {
      this.mouseOn = node.sectionID;
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
          if (this.focusedId == node.sectionID) {
            this.focusIdHold = node.sectionID;
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
          if (this.focusIdHold == node.sectionID) {

            this.focusedId = this.focusIdHold;
            this.focusIdHold = '';
          }
          el.className = `border ${borderClass}Inactive`;

          /* if(this.focusedId == this.node.sectionID){
            el.classList.add(focusClass);
          } */

          /* el.classList.remove(borderClass)
          el.classList.remove(borderClass)
          el.classList.add(borderClass+"Inactive") */
          el.children.item(0).style.display = 'none';
        }

      }
    });
  }

}
