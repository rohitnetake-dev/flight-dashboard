import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Flight } from '../../models/flight.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-flight-details',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, StatusBadgeComponent],
  templateUrl: './flight-details.component.html',
  styleUrl: './flight-details.component.scss'
})
export class FlightDetailsComponent {
  @Input() flight: Flight | null = null;
  @Output() closed = new EventEmitter<void>();
}
