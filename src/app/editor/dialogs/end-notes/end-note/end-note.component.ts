import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { endNote } from '@app/editor/utils/interfaces/endNotes';

@Component({
  selector: 'app-end-note',
  templateUrl: './end-note.component.html',
  styleUrls: ['./end-note.component.scss']
})
export class EndNoteComponent implements AfterViewInit {
  @Input() endNote ?: endNote ;
  @Output() endNoteChange = new EventEmitter<endNote>();
  @Input() endNoteIndex ?: number

  urlSafe?: SafeResourceUrl;
  constructor(public sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
  }

}
