import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantaoService, Plantao } from '../../../../core/services/plantao.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-plantao-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantao-list.component.html',
  styleUrl: './plantao-list.component.scss',
})
export class PlantaoListComponent implements OnInit {
  plantoes$!: Observable<Plantao[]>;

  constructor(private plantaoService: PlantaoService) {}

  ngOnInit(): void {
    this.plantoes$ = this.plantaoService.getPlantoes();
  }
}
