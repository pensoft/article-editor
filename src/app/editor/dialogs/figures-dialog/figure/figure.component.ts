import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { figure as figure_interface } from 'src/app/editor/utils/interfaces/figureComponent';

@Component({
  selector: 'app-figure',
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.scss']
})
export class FigureComponent implements AfterViewInit {
  @Input() figure ?: figure_interface ;
  @Output() figureChange = new EventEmitter<figure_interface>();
  @Input() figureIndex ?: number

  urlSafe?: SafeResourceUrl;
  constructor(public sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
  }

}
