import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trip } from './models/trip';
import { Authentication } from './authentication';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripData {
  private readonly apiUrl = `${environment.apiUrl}/trips`;

  constructor(
    private http: HttpClient,
    private authentication: Authentication
  ) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl);
  }

  getTrip(tripCode: string): Observable<Trip> {
    return this.http.get<Trip>(
      `${this.apiUrl}/${tripCode}`
    );
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(
      this.apiUrl,
      trip,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  updateTrip(trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(
      `${this.apiUrl}/${trip.code}`,
      trip,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  deleteTrip(tripCode: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${tripCode}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authentication.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}