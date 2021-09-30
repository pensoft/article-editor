import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  rank: string;
  scientificName: string;
  commonName: string;
}

@Component({
  selector: 'app-add-leaf',
  templateUrl: './add-taxonomy.component.html',
  styleUrls: [ './add-taxonomy.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTaxonomyComponent {
  dataChanged: any;

  constructor(
    public dialogRef: MatDialogRef<AddTaxonomyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onChange($event: any) {
    this.dataChanged = {
      rank: $event.data.firstName,
      scientificName: $event.data.lastName,
      commonName: $event.data.email
    };
  }
}
