import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime } from 'rxjs';

import { Airport, FlightFilters, FlightStatus } from '../../models/flight.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent {
  @Input() origins: Airport[] = [];
  @Input() destinations: Airport[] = [];
  @Output() filtersChange = new EventEmitter<FlightFilters>();

  statuses: FlightStatus[] = ['Scheduled', 'Active', 'Delayed', 'Arrived'];

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    search: '',
    status: '',
    origin: '',
    destination: ''
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe(value => this.filtersChange.emit(value as FlightFilters));
  }

  reset(): void {
    this.form.reset();
  }
}
