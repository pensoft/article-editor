import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingInDetailsComponent } from './sing-in-details.component';

describe('SingInDetailsComponent', () => {
  let component: SingInDetailsComponent;
  let fixture: ComponentFixture<SingInDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingInDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingInDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
