import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';
import { supplementaryFile } from '@app/editor/utils/interfaces/supplementaryFile';

@Component({
  selector: 'app-supplementary-file',
  templateUrl: './supplementary-file.component.html',
  styleUrls: ['./supplementary-file.component.scss']
})
export class SupplementaryFileComponent implements AfterViewInit {
  @Input() supplementaryFile ?: supplementaryFile ;
  @Output() supplementaryFileChange = new EventEmitter<supplementaryFile>();
  @Input() supplementaryFileIndex ?: number

  urlSafe?: SafeResourceUrl;
  constructor(public sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
  }

}
