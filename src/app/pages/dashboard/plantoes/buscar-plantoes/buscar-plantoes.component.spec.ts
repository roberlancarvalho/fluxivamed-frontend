import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscarPlantoesComponent } from './buscar-plantoes.component';


describe('BuscarPlantoes', () => {
  let component: BuscarPlantoesComponent;
  let fixture: ComponentFixture<BuscarPlantoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarPlantoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarPlantoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
function beforeEach(arg0: () => Promise<void>) {
  throw new Error('Function not implemented.');
}

