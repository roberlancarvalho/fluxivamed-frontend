import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarPlantaoComponent } from './criar-plantao.component';

describe('CriarPlantao', () => {
  let component: CriarPlantaoComponent;
  let fixture: ComponentFixture<CriarPlantaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarPlantaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarPlantaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
