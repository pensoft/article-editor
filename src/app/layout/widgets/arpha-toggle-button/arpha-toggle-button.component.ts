import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'arpha-toggle-button',
  templateUrl: './arpha-toggle-button.component.html',
  styleUrls: ['./arpha-toggle-button.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ArphaToggleButtonComponent),
    multi: true
  }]
})
export class ArphaToggleButtonComponent implements ControlValueAccessor, OnInit {

  @Input() disabled: boolean = false;
  @Input() leftIcon: string = '';
  @Input() rightIcon: string = '';
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
