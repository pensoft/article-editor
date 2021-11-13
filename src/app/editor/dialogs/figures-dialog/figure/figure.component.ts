import { AfterViewInit, Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { figure as f } from 'src/app/editor/utils/interfaces/figureComponent';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url:string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-figure',
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.scss']
})
export class FigureComponent implements AfterViewInit {
  @Input() figure ?: f ;
  @Input() figureIndex ?: number

  urlSafe?: SafeResourceUrl;
  constructor(public sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
  }

}
