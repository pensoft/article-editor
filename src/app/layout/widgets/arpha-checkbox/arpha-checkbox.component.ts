import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'arpha-checkbox',
  templateUrl: './arpha-checkbox.component.html',
  styleUrls: ['./arpha-checkbox.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ArphaCheckboxComponent),
    multi: true
  }]
})
export class ArphaCheckboxComponent implements ControlValueAccessor, OnInit {

  @Input() disabled: boolean = false;
  checked: boolean = false;

  onChange: any = () => { };
  onTouch: any = () => { };

  constructor() { }

  ngOnInit(): void {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(checked: boolean) {
    this.checked = checked;
  }

  onModelChange(e: boolean) {
    this.checked = e;
    this.onChange(e);
  }
}
