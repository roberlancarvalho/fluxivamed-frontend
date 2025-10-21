import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisponibilidadeComponent } from './disponibilidade.component';

describe('Disponibilidade', () => {
  let component: DisponibilidadeComponent;
  let fixture: ComponentFixture<DisponibilidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibilidadeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisponibilidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
