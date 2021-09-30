import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-validaiton-spinner',
  templateUrl: './validation-spinner.component.html',
  styleUrls: ['./validation-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationSpinnerComponent {
  constructor(private spinner: NgxSpinnerService) {
    this.spinner.show('sp3');
  }

  cancelValidation() {

  }
}
