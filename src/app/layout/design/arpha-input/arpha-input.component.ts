import { Component, forwardRef, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'arpha-input',
  templateUrl: './arpha-input.component.html',
  styleUrls: ['./arpha-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ArphaInputComponent),
    multi: true
  }]
})
export class ArphaInputComponent implements OnInit, ControlValueAccessor {

  @Input() type = 'text';
  @Input() id = '';
  @Input() name = '';
  @Input() placeholder = '';
  @Input() isValid = true;
  @Input() disabled = false;

  @Input() label = '';
  @Input() errorMessage = '';

  revealPassword = false;

  value = '';

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor() { }

  ngOnInit(): void {
  }

  onValueChange(event: any) {
    this.onChange(event.target.value);
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  revealText() {
    this.revealPassword = !this.revealPassword;
    this.type = this.revealPassword ? 'text' : 'password';
  }
}
