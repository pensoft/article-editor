import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddFilesComponent } from './dialog-add-files.component';

describe('DialogAddFilesComponent', () => {
  let component: DialogAddFilesComponent;
  let fixture: ComponentFixture<DialogAddFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAddFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
