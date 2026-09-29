import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Flight } from '../../models/flight.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './flight-list.component.html',
  styleUrl: './flight-list.component.scss'
})
export class FlightListComponent {
  @Input() flights: Flight[] = [];
  @Input() selectedId: number | null = null;
  @Output() flightSelected = new EventEmitter<Flight>();
}
