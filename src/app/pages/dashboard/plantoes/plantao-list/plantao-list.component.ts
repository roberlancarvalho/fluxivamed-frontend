import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Plantao, PlantaoService } from '../../../../core/services/plantao.service';

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
