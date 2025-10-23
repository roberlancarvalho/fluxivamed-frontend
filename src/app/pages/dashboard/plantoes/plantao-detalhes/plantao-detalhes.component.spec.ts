import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantaoDetalhesComponent } from './plantao-detalhes.component';

describe('PlantaoDetalhes', () => {
  let component: PlantaoDetalhesComponent;
  let fixture: ComponentFixture<PlantaoDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantaoDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantaoDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
