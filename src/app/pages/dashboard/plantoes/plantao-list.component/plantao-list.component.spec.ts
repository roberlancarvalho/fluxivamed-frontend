import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantaoListComponent } from './plantao-list.component';

describe('PlantaoListComponent', () => {
  let component: PlantaoListComponent;
  let fixture: ComponentFixture<PlantaoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantaoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantaoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
