import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { E } from '@angular/cdk/keycodes';
import { ViewFlags } from '@angular/compiler/src/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ChooseSectionComponent } from '@app/editor/dialogs/choose-section/choose-section.component';
import { TreeService } from '@app/editor/meta-data-tree/tree-service/tree.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { checkCompatibilitySectionFromBackend, checkIfSectionsAreAboveOrAtMax, checkIfSectionsAreUnderOrAtMin, countSectionFromBackendLevel, filterChooseSectionsFromBackend, filterSectionsFromBackendWithComplexMinMaxValidations, renderSectionFunc } from '@app/editor/utils/articleBasicStructure';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import { complexSectionFormIoSchema } from '@app/editor/utils/section-templates/form-io-json/complexSection';
import { uuidv4 } from 'lib0/random';

@Component({
  selector: 'app-complex-edit-tree',
  templateUrl: './complex-edit-tree.component.html',
  styleUrls: ['./complex-edit-tree.component.scss']
})
export class ComplexEditTreeComponent implements OnInit {

  mouseOn: any;
  focusedId: any;
  focusIdHold: any;

  canDropBool?: boolean[]

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  @Input() sectionChildren!: articleSection[];
  @Output() sectionChildrenChange = new EventEmitter<articleSection[]>();

  @Input() deletedSections!: articleSection[];
  @Output() deletedSectionsChange = new EventEmitter<articleSection[]>();

  @Input() addedSections!: articleSection[];
  @Output() addedSectionsChange = new EventEmitter<articleSection[]>();

  constructor(
    private sectionsService: ArticleSectionsService,
    public dialog: MatDialog,
    private treeService: TreeService,
    private serviceShare:ServiceShare
  ) {

  }

  ngOnInit(): void {
    this.canDropBool = this.treeService.canDropBool
  }

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



  oldTextValue?: string
  checkTextInput(element: HTMLDivElement, maxlength: number, event: Event) {
    if (/<\/?[a-z][\s\S]*>/i.test(element.innerHTML)) {
      element.innerHTML = element.textContent!;
    }
    if (element.textContent?.trim().length! > maxlength) {
      element.innerHTML = this.oldTextValue!
    } else if (element.textContent?.trim().length! == maxlength) {
      this.oldTextValue = element.textContent!.trim();
    }
  }

  oldZIndex?: string
  makeEditable(element: HTMLDivElement, event: Event, parentNode: any, node: articleSection) {
    if (event.type == 'blur') {
      element.setAttribute('contenteditable', 'false');
      (parentNode as HTMLDivElement).style.zIndex = this.oldZIndex!;
      let childRef = this.findSectionById(node.sectionID)
      childRef.title.label = element.textContent!;

    } else if (event.type == 'click') {
      this.oldZIndex = (parentNode as HTMLDivElement).style.zIndex!
      element.setAttribute('contenteditable', 'true');
      (parentNode as HTMLDivElement).style.zIndex = '5';
      element.focus()
    }

  }

  addNewSubsection() {
    let nodeLevel = this.treeService.getNodeLevel(this.section);
    this.sectionsService.getAllSections({ page: 1, pageSize: 999 }).subscribe((response: any) => {
      let sectionTemplates1 = filterChooseSectionsFromBackend(this.section.compatibility, response.data)
      let { nodeLevel: sectionlevel } = this.treeService.getNodeLevel(this.section)
      let sectionTemplates = (sectionTemplates1 as any[]).filter((el: any) => {
        let elementLevel = countSectionFromBackendLevel(el)
        return (elementLevel + sectionlevel < 3);
      });

      sectionTemplates = filterSectionsFromBackendWithComplexMinMaxValidations(sectionTemplates,this.section,this.sectionChildren)
      const dialogRef = this.dialog.open(ChooseSectionComponent, {
        width: '563px',
        panelClass: 'choose-namuscript-dialog',
        data: { templates: sectionTemplates, sectionlevel }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.sectionsService.getSectionById(result).subscribe((res: any) => {
          let sectionTemplate = res.data
          let newSection = renderSectionFunc(sectionTemplate, this.sectionChildren,this.serviceShare.YdocService!.ydoc,this.serviceShare)
          this.addedSections.push(newSection);
        })
      });
    })
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

  }

  showAddBtn(node: articleSection) {
    return checkIfSectionsAreAboveOrAtMax(node, this.section, this.sectionChildren);
  }

  showDeleteBtn(node: articleSection) {
    return checkIfSectionsAreUnderOrAtMin(node, this.section, this.sectionChildren);
  }

  deleteNodeHandle(node: articleSection, index: number) {
    this.sectionChildren.splice(index, 1);
    let indexOfAdded = this.addedSections.findIndex((el) => el.sectionID == node.sectionID)
    if (indexOfAdded !== -1) {
      this.addedSections.splice(indexOfAdded, 1);
    } else {
      this.deletedSections.push(node);
    }
  }

  findSectionById(sectionID: string): articleSection {
    let returnValue
    this.sectionChildren.forEach((section) => {
      if (section.sectionID == sectionID) {
        returnValue = section;
      }
    })
    //@ts-ignore
    return returnValue;
  }



  addNodeHandle(node: articleSection, index: number) {
    this.sectionsService.getSectionById(node.sectionTypeID).subscribe((res: any) => {
      let sectionTemplate = res.data;
      let newSection = renderSectionFunc(sectionTemplate, this.sectionChildren,this.serviceShare.YdocService!.ydoc,this.serviceShare, index);
      this.addedSections.push(newSection);
    })
  }
}
