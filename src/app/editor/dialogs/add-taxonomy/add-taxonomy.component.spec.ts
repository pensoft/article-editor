import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaxonomyComponent } from 'src/app/editor/dialogs/add-taxonomy/add-taxonomy.component';

describe('AddLeafComponent', () => {
  let component: AddTaxonomyComponent;
  let fixture: ComponentFixture<AddTaxonomyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTaxonomyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTaxonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
