import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-print-element',
  templateUrl: './print-element.component.html',
  styleUrls: ['./print-element.component.scss']
})
export class PrintElementComponent implements AfterViewInit {

  @Input() elementHTML!: any;
  @Output() elementHTMLChange = new EventEmitter<any>();
  @ViewChild('printElement', { read: ElementRef }) printElement?: ElementRef;

  constructor(private changeDetectorRef: ChangeDetectorRef,) { }

  ngAfterViewInit(): void {
    //@ts-ignore
    this.printElement?.nativeElement.innerHTML = this.elementHTML
    this.changeDetectorRef.detectChanges();
  }

}
