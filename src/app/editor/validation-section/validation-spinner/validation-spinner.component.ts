import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-validaiton-spinner',
  templateUrl: './validation-spinner.component.html',
  styleUrls: ['./validation-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationSpinnerComponent implements AfterViewInit,OnDestroy {

  @Input() progress!: number;
  @Output() progressChange = new EventEmitter<number>();

  deg = 0;
  @ViewChild('spinner', { read: ElementRef }) spinnerEl?: ElementRef;

  intervalID :any

  constructor(private spinner: NgxSpinnerService) {
    this.spinner.show('sp3');
  }

  cancelValidation() {

  }

  ngOnDestroy(): void {
      clearInterval(this.intervalID)
  }

  ngAfterViewInit(): void {
    this.intervalID = setInterval(() => {
      this.deg = this.deg-45;
      if(this.deg == -360){
        this.deg = 0;
      }
      (this.spinnerEl!.nativeElement as HTMLImageElement).style.webkitTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement as HTMLImageElement).style.mozTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement as HTMLImageElement).style.msTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement as HTMLImageElement).style.oTransform = 'rotate(' + this.deg + 'deg)';
      //@ts-ignore
      (this.spinnerEl!.nativeElement as HTMLImageElement).style.transform = 'rotate(' + this.deg + 'deg)';
    }, 100)
  }
}
