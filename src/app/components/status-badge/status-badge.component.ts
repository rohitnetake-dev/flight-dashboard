import { Component, Input } from '@angular/core';

import { FlightStatus } from '../../models/flight.model';

// the .status-badge colours live in styles.scss because the map popup uses them too
@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span [class]="'status-badge status-' + status.toLowerCase()">{{ status }}</span>`
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: FlightStatus;
}
