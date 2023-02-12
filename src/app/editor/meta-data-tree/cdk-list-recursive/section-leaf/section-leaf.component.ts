import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EditSectionDialogComponent} from '../../../dialogs/edit-section-dialog/edit-section-dialog.component';
import {ProsemirrorEditorsService} from '../../../services/prosemirror-editors.service';
import {YdocService} from '../../../services/ydoc.service';
import {DetectFocusService} from '../../../utils/detectFocusPlugin/detect-focus.service';
import {articleSection} from '../../../utils/interfaces/articleSection';
import {TreeService} from '../../tree-service/tree.service';
import {DOMParser} from 'prosemirror-model';
//@ts-ignore
import {updateYFragment} from '../../../../y-prosemirror-src/plugins/sync-plugin.js'
import {FormBuilderService} from '../../../services/form-builder.service';
import {FormGroup} from '@angular/forms';
import { map } from 'rxjs/operators';

//@ts-ignore
import * as Y from 'yjs'
//@ts-ignore
import {AskBeforeDeleteComponent} from '@app/editor/dialogs/ask-before-delete/ask-before-delete.component';
import {ServiceShare} from '@app/editor/services/service-share.service';
import {
  countSectionFromBackendLevel,
  filterChooseSectionsFromBackend,
  filterSectionsFromBackendWithComplexMinMaxValidations,
} from '@app/editor/utils/articleBasicStructure';
import {PmDialogSessionService} from '@app/editor/services/pm-dialog-session.service';
import {ChooseSectionComponent} from '@app/editor/dialogs/choose-section/choose-section.component';
import {material} from "@core/services/custom_sections/material";
import {treatmentSectionsSubsection} from "@core/services/custom_sections/tratment_sections_subsection";
import {treatmentSectionsCustom} from "@core/services/custom_sections/treatment_sections_description";
import {taxonSection} from "@core/services/custom_sections/taxon";
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { filterFieldsValues } from '@app/editor/utils/fieldsMenusAndScemasFns';

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

  previewMode
  expandIcon?: string;
  focusIdHold?: string;
  taxonomyData: any;

  //nodesForms:{[key:string]:FormGroup} = {}
  @Input() node!: articleSection;
  @Output() nodeChange = new EventEmitter<articleSection>();

  @Input() nodeFormGroup!: FormGroup;
  @Output() nodeFormGroupChange = new EventEmitter<FormGroup>();

  @Input() lastNestedChild!: boolean;
  @Input() nestedNode!: boolean;

  @Input() isComplex!: boolean;

  @Input() sectionsFormGroupsRef!: { [key: string]: FormGroup }
  @Output() sectionsFormGroupsRefChange = new EventEmitter<FormGroup>();


  @ViewChild('cdkDragSection', {read: ElementRef}) dragSection?: ElementRef;

  constructor(
    private formBuilderService: FormBuilderService,
    public treeService: TreeService,
    public ydocService: YdocService,
    private serviceShare: ServiceShare,
    public enforcer: EnforcerService,
    public detectFocusService: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public PmDialogSessionService: PmDialogSessionService,
    public dialog: MatDialog) {
    this.previewMode = prosemirrorEditorsService.previewArticleMode
    detectFocusService.getSubject().subscribe((focusedEditorId: any) => {
      if (focusedEditorId) {
        this.focusedId = focusedEditorId;
      }

      if (this.parentId !== 'parentList' && this.node.sectionID == this.focusedId) {
        (this.dragSection!.nativeElement as HTMLDivElement).scrollIntoView({behavior: 'smooth', block: 'center'})
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
      let defaultValues = formGroup.value;
      filterFieldsValues( node.formIOSchema,{data:defaultValues},this.serviceShare,node.sectionID,true,'',false)
      let sectionContent = this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID, formGroup);

      let updateYdoc = new Y.Doc();
      let maindocstate = Y.encodeStateAsUpdate(this.ydocService.ydoc)
      Y.applyUpdate(updateYdoc, maindocstate)
      let updateXmlFragment = updateYdoc.getXmlFragment(node.sectionID);

      let xmlToCopyFrom = this.ydocService.ydoc.getXmlFragment(node.sectionID);
      /*updateXmlFragment.insert(0, xmlToCopyFrom.toArray().map((item: any) => item instanceof Y.AbstractType ? item.clone() : item)); */

      let originUpdates: any[] = [];
      let registerUpdateFunc = (update: any) => {
        originUpdates.push(update)
      }

      this.ydocService.ydoc.on('update', registerUpdateFunc)
      //this.PmDialogSessionService.createSession();

      node.formIOSchema = sectionContent
        this.dialog.open(EditSectionDialogComponent, {
          //width: '100%',
          // height: '90%',
          data: {node: node, form: formGroup, sectionContent},
          disableClose: false
        }).afterClosed().subscribe(result => {

          if (result && result.compiledHtml) {
            //this.PmDialogSessionService.endSession(true);
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
            let node1 = DOMParser.fromSchema(this.prosemirrorEditorsService.editorContainers[node.sectionID].editorView.state.schema).parse(templDiv.firstChild!);
            if (trackStatus) {
              //const snapshotFromBackGround = Y.snapshot(this.ydocService.ydoc);
              updateYFragment(updateYdoc, updateXmlFragment, node1, new Map());
              //const updatedSnapshot = Y.snapshot(this.ydocService.ydoc)
              //let editorView = this.prosemirrorEditorsService.editorContainers[node.sectionID].editorView
              copyOriginUpdatesBeforeReplace.forEach((update) => {
                Y.applyUpdate(updateYdoc, update);
              })
              let xmlElements = xmlToCopyFrom.toArray().length

              let maindocstate = Y.encodeStateAsUpdate(updateYdoc)
              Y.applyUpdate(this.ydocService.ydoc, maindocstate)
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
              /* this.serviceShare.YjsHistoryService.addUndoItemInformation({
                type: 'figure-citation',
                data: {}
              }) */
              setTimeout(()=>{
                this.serviceShare.updateCitableElementsViews()
                //this.serviceShare.FiguresControllerService.updateOnlyFiguresView()
              },10)
            }, 30)

          } else {
            setTimeout(() => {
              //this.serviceShare.PmDialogSessionService!.endSession(false);
            }, 30)
          }
          this.ydocService.ydoc.off('update', registerUpdateFunc)

        });
    } catch (e) {
      console.error(e);
    }
  }

  addNodeHandle(nodeId: string) {
    this.prosemirrorEditorsService.spinSpinner();
    this.treeService.addNodeChange(nodeId,this.prosemirrorEditorsService.stopSpinner);
  }

  deleteNodeHandle(nodeId: string) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      width: '563px',
      data: {objName: this.treeService.findNodeById(nodeId)?.title.label,type:'section'},
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.treeService.deleteNodeChange(nodeId, this.parentId!);
      }
    })
  }
  oldIndex?:string
  scrolledToView?: boolean

  makeEditable(element: HTMLDivElement, event: Event, parentNode: any, node: articleSection) {
    if (element.textContent?.trim().length == 0) {
      element.innerHTML = "<br>"
      return
    }
    if (event.type == 'blur') {
      element.setAttribute('contenteditable', 'false');
      element.setAttribute('style', '');
      /* (parentNode as HTMLDivElement).style.zIndex = this.oldIndex;
      this.oldIndex = undefined */
      this.treeService.saveNewTitleChange(node, element.textContent!);
      this.scrolledToView = false;
    } else if (event.type == 'click') {
      element.setAttribute('contenteditable', 'true');
      //let elementZIndex = window.getComputedStyle(element).zIndex;
      /* if(this.oldIndex!=elementZIndex){
        this.oldIndex = elementZIndex
      } */
      //(parentNode as HTMLDivElement).style.zIndex = '11';
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

  addSectionToNode(node: articleSection, formGroup: FormGroup) {
    this.prosemirrorEditorsService.spinSpinner()
    if (node.title.name === '[MM] Materials') {
      material.parent = node;
      const materialData = JSON.parse(JSON.stringify(material));
      materialData.initialRender = this.serviceShare.YdocService.ydoc.guid
      materialData.active = true;
      materialData.defaultFormIOValues = {};
      let sectionContent = this.formBuilderService.populateDefaultValues({}, node.formIOSchema, node.sectionID, formGroup);
      this.prosemirrorEditorsService.stopSpinner()
      this.dialog.open(EditSectionDialogComponent, {
        //width: '100%',
        // height: '90%',
        data: {node: node, form: formGroup, sectionContent, component: '[MM] Material',editOnAddFromParent:true},
        disableClose: false
      }).afterClosed().subscribe(result => {
        if(result && result.data) {
          materialData.defaultFormIOValues = result.data;
          this.serviceShare.TreeService!.addNodeAtPlaceChange(node.sectionID, materialData, 'end');
        }
      });
    } else if (['[MM] Description', '[MM] Diagnosis', '[MM] Distribution', '[MM] Ecology', '[MM] Conservation', '[MM] Biology', '[MM] Taxon discussion', '[MM] Notes', '[MM] Custom'].indexOf(node.title.name) > -1) {
      const treatmentSectionsSubsectionData = JSON.parse(JSON.stringify(treatmentSectionsSubsection));
      treatmentSectionsSubsectionData.parent = node;
      this.prosemirrorEditorsService.stopSpinner()
      this.serviceShare.TreeService!.addNodeAtPlaceChange(node.sectionID, treatmentSectionsSubsectionData, 'end');
    } else if ('[MM] Treatment sections' === node.title.name) {
      const treatmentSectionsCustomData = JSON.parse(JSON.stringify(treatmentSectionsCustom));
      treatmentSectionsCustomData.parent = node;
      this.prosemirrorEditorsService.stopSpinner()
      this.serviceShare.TreeService!.addNodeAtPlaceChange(node.sectionID, treatmentSectionsCustom, 'end');
    } else {
      taxonSection.parent = node;
      this.serviceShare.ArticleSectionsService!.getAllSections({page: 1, pageSize: 999}).pipe(map((res: any) => {
        //res.data.push(taxonSectionData);
        return res
      })).subscribe((response: any) => {
        let sectionTemplates1 = filterChooseSectionsFromBackend(node.compatibility, response.data)
        let sectionlevel = this.treeService.getNodeLevel(node)
        let sectionTemplates = (sectionTemplates1 as any[]).filter((el: any) => {
          let elementLevel = countSectionFromBackendLevel(el)
          return (elementLevel + sectionlevel < 3);
        });
        sectionTemplates = filterSectionsFromBackendWithComplexMinMaxValidations(sectionTemplates, node, node.children);
        this.prosemirrorEditorsService.stopSpinner()
        if(sectionTemplates && sectionTemplates.length === 1) {
          sectionTemplates[0].parent = node;
          this.serviceShare.TreeService!.addNodeAtPlaceChange(node.sectionID, sectionTemplates[0], 0)
        } else {
          const dialogRef = this.dialog.open(ChooseSectionComponent, {
            width: '563px',
            panelClass: 'choose-namuscript-dialog',
            data: {templates: sectionTemplates, sectionlevel}
          });
          dialogRef.afterClosed().subscribe(result => {
            if(result){
              this.serviceShare.ArticleSectionsService!.getSectionById(result).subscribe((res: any) => {
                res.data.parent = node;
                this.serviceShare.TreeService!.addNodeAtPlaceChange(node.sectionID, res.data, 0)
              })
            }
          });
        }
      })
    }
  }

  showButtons(div: HTMLDivElement, mouseOn: boolean, borderClass: string, focusClass: string, node: articleSection) {
    /* if(mouseOn){
      div.style.zIndex = '4';
    }else{
      div.style.zIndex = '5';
    } */

    if (mouseOn) {
      this.mouseOn = node.sectionID;
    } else {
      this.mouseOn = '';
    }
    Array.from(div.children).forEach((el: any) => {
      if (el.classList.contains('section_btn_container')) {
        Array.from(el.children).forEach((el: HTMLButtonElement, index) => {
          if (el.classList.contains('hidden')) {
            if (mouseOn) {
              if (el.getAttribute('buttonaction') == 'add'&& this.treeService.showAddBtn(node)) { // add btn
                el.style.display = 'inline';
              } else if (el.getAttribute('buttonaction') == 'delete'&& this.treeService.showDeleteButton(node)) { // delete btn
                el.style.display = 'inline';
              } else if (el.getAttribute('buttonaction') == 'post_add'&& node.type == 'complex'&&this.treeService.showAddSubsectionBtn(node)) { // add subsection btn
                el.style.display = 'inline';
              } else if (el.getAttribute('buttonaction') == 'edit') {
                el.style.display = 'inline';
              }
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
