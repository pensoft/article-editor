import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';

@Component({
  selector: 'app-citable-table',
  templateUrl: './citable-table.component.html',
  styleUrls: ['./citable-table.component.scss']
})
export class CitableTableComponent implements AfterViewInit {
  @Input() table ?: citableTable ;
  @Output() tableChange = new EventEmitter<citableTable>();
  @Input() tableIndex ?: number

  urlSafe?: SafeResourceUrl;
  constructor(public sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
  }

}
