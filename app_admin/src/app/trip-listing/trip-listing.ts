import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TripCard } from '../trip-card/trip-card';
import { Trip } from '../models/trip';
import { TripData } from '../trip-data';

type SortField = 'name' | 'start' | 'perPerson';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, TripCard],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css'
})
export class TripListing implements OnInit {
  // Original dataset retrieved from the API.
  private allTrips: Trip[] = [];

  // Processed dataset displayed by the template.
  trips = signal<Trip[]>([]);
  message = signal('');

  searchTerm = '';
  resortFilter = '';
  sortField: SortField = 'name';
  sortDirection: SortDirection = 'asc';

  constructor(private tripData: TripData) {}

  ngOnInit(): void {
    this.getTrips();
  }

  private getTrips(): void {
    this.tripData.getTrips().subscribe({
      next: (value: Trip[]) => {
        this.allTrips = [...value];
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error retrieving trips:', error);
        this.allTrips = [];
        this.trips.set([]);
        this.message.set('Error retrieving trips from the database.');
      }
    });
  }

  public applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const resort = this.resortFilter.trim().toLowerCase();

    // Work from the original collection so filters do not permanently
    // remove elements from the source dataset.
    let results = [...this.allTrips];

    // Linear search across several trip properties.
    if (search) {
      results = results.filter((trip: Trip) =>
        trip.code.toLowerCase().includes(search) ||
        trip.name.toLowerCase().includes(search) ||
        trip.resort.toLowerCase().includes(search)
      );
    }

    // Apply an optional resort filter.
    if (resort) {
      results = results.filter(
        (trip: Trip) => trip.resort.toLowerCase() === resort
      );
    }

    // Sort the processed collection using the selected comparator.
    results.sort((a: Trip, b: Trip) => {
      let comparison = 0;

      switch (this.sortField) {
        case 'start':
          comparison =
            new Date(a.start).getTime() -
            new Date(b.start).getTime();
          break;

        case 'perPerson':
          comparison =
            this.getNumericPrice(a.perPerson) -
            this.getNumericPrice(b.perPerson);
          break;

        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return this.sortDirection === 'asc'
        ? comparison
        : -comparison;
    });

    this.trips.set(results);
    this.updateMessage(results.length);
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.resortFilter = '';
    this.sortField = 'name';
    this.sortDirection = 'asc';

    this.applyFilters();
  }

  public getResorts(): string[] {
    return [
      ...new Set(
        this.allTrips
          .map((trip: Trip) => trip.resort)
          .filter((resort: string) => resort)
      )
    ].sort((a: string, b: string) => a.localeCompare(b));
  }

  private getNumericPrice(price: string | number): number {
    const numericPrice = Number(
      String(price).replace(/[$,\s]/g, '')
    );

    return Number.isNaN(numericPrice) ? 0 : numericPrice;
  }

  private updateMessage(resultCount: number): void {
    if (this.allTrips.length === 0) {
      this.message.set(
        'There were no trips retrieved from the database.'
      );
      return;
    }

    if (resultCount === 0) {
      this.message.set(
        'No trips match the current search and filter criteria.'
      );
      return;
    }

    this.message.set(
      `Showing ${resultCount} of ${this.allTrips.length} trips.`
    );
  }
}