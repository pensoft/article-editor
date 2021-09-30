import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-validation-section',
  templateUrl: './validation-section.component.html',
  styleUrls: [ './validation-section.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationSectionComponent {
  spinnerComponent!: boolean;

  validate() {
    this.spinnerComponent = true;
  }
}
