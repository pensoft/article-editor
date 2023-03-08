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

  downloadFile(event: MouseEvent) {
    event.preventDefault();
    const url = (event.target as HTMLAnchorElement)
    .href
    // .replace("https://ps-cdn.dev.scalewest.com/", "/");
    const filename = url.split('/').pop();
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {        
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        console.log(url);
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      })
      .catch(err => console.error(err));
  }

}
