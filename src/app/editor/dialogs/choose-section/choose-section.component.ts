import {AfterViewChecked, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {countSectionFromBackendLevel} from '@app/editor/utils/articleBasicStructure';
import {materials} from "@core/services/custom_sections/materials";
import {treatmentSections} from "@core/services/custom_sections/treatment_sections";
import {taxonTreatmentSection} from "@core/services/custom_sections/taxon_treatment_section";

@Component({
  selector: 'app-choose-section',
  templateUrl: './choose-section.component.html',
  styleUrls: ['./choose-section.component.scss']
})
export class ChooseSectionComponent implements OnInit,AfterViewChecked {

  showError = false;
  sectionTemplates: any[] = [];
  value = undefined

  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChooseSectionComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { templates: any[], sectionlevel: number },
  ) {

  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    /*this.data.templates.push(
      taxonTreatmentSection
    )*/
    this.sectionTemplates = this.data.templates
  }

  chooseSection(val: any) {
    if (!val) {
      this.showError = true
      setTimeout(() => {
        this.showError = false
      }, 1000)
    } else {
      this.dialogRef.close(val)
    }
  }

  closeSectionChoose() {
    this.dialogRef.close()
  }

  public search(value: any) {
    this.value = value
  }

}
