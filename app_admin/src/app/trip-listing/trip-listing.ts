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
        // Preserve the original collection.
        this.allTrips = [...value];
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error retrieving trips:', error);
        this.allTrips = [];
        this.trips.set([]);
        this.message.set(
          'Error retrieving trips from the database.'
        );
      }
    });
  }

  public applyFilters(): void {
    // Each operation returns a new array, creating a predictable
    // search -> filter -> sort processing pipeline.
    let results = [...this.allTrips];

    results = this.searchTrips(results, this.searchTerm);
    results = this.filterTripsByResort(
      results,
      this.resortFilter
    );
    results = this.sortTrips(
      results,
      this.sortField,
      this.sortDirection
    );

    this.trips.set(results);
    this.updateMessage(results.length);
  }

  private searchTrips(
    trips: Trip[],
    searchTerm: string
  ): Trip[] {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return trips;
    }

    return trips.filter((trip: Trip) =>
      trip.code.toLowerCase().includes(search) ||
      trip.name.toLowerCase().includes(search) ||
      trip.resort.toLowerCase().includes(search)
    );
  }

  private filterTripsByResort(
    trips: Trip[],
    resortFilter: string
  ): Trip[] {
    const resort = resortFilter.trim().toLowerCase();

    if (!resort) {
      return trips;
    }

    return trips.filter(
      (trip: Trip) =>
        trip.resort.toLowerCase() === resort
    );
  }

  private sortTrips(
    trips: Trip[],
    field: SortField,
    direction: SortDirection
  ): Trip[] {
    // Copy the array before sorting so the incoming collection
    // is not modified in place.
    const sortedTrips = [...trips];

    sortedTrips.sort((a: Trip, b: Trip) => {
      const comparison = this.compareTrips(a, b, field);

      return direction === 'asc'
        ? comparison
        : -comparison;
    });

    return sortedTrips;
  }

  private compareTrips(
    a: Trip,
    b: Trip,
    field: SortField
  ): number {
    switch (field) {
      case 'start':
        return (
          new Date(a.start).getTime() -
          new Date(b.start).getTime()
        );

      case 'perPerson':
        return (
          this.getNumericPrice(a.perPerson) -
          this.getNumericPrice(b.perPerson)
        );

      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.resortFilter = '';
    this.sortField = 'name';
    this.sortDirection = 'asc';

    this.applyFilters();
  }

  public getResorts(): string[] {
    // Set removes duplicate resort names from the collection.
    const uniqueResorts = new Set<string>();

    for (const trip of this.allTrips) {
      if (trip.resort) {
        uniqueResorts.add(trip.resort);
      }
    }

    return Array
      .from(uniqueResorts)
      .sort((a: string, b: string) =>
        a.localeCompare(b)
      );
  }

  private getNumericPrice(
    price: string | number
  ): number {
    const numericPrice = Number(
      String(price).replace(/[$,\s]/g, '')
    );

    return Number.isNaN(numericPrice)
      ? 0
      : numericPrice;
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