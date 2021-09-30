import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaxonomyService } from 'src/app/editor/dialogs/add-taxonomy/taxonomy.service';

@Component({
  selector: 'app-taxonomy-editor',
  templateUrl: './taxonomy-editor.component.html',
  styleUrls: [ './taxonomy-editor.component.scss' ]
})
export class TaxonomyEditorComponent implements OnInit {
  dataSource: any;
  displayedColumns: string[] = ['rank', 'scientificName', 'commonName'];
  constructor(private taxonomyService: TaxonomyService, private cdf: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.taxonomyService.taxonomy.subscribe(x => {
      this.cdf.detectChanges()
      this.dataSource = [
        {rank: x.rank, scientificName: x.scientificName, commonName: x.commonName}
      ]
    });
  }

}
