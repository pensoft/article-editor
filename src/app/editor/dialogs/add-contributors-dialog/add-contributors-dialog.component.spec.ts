import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContributorsDialogComponent } from './add-contributors-dialog.component';

describe('AddContributorsDialogComponent', () => {
  let component: AddContributorsDialogComponent;
  let fixture: ComponentFixture<AddContributorsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContributorsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContributorsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
