import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { FlightKpis } from '../../models/flight.model';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  @Input({ required: true }) kpis!: FlightKpis;

  get cards() {
    return [
      { label: 'Total flights', value: this.kpis.total, icon: 'flight', type: 'total' },
      { label: 'Active flights', value: this.kpis.active, icon: 'flight_takeoff', type: 'active' },
      { label: 'Delayed flights', value: this.kpis.delayed, icon: 'schedule', type: 'delayed' },
      { label: 'Arrived flights', value: this.kpis.arrived, icon: 'flight_land', type: 'arrived' }
    ];
  }
}
