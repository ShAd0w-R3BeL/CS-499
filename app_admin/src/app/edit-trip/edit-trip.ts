import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TripData } from '../trip-data';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-trip.html',
  styleUrl: './edit-trip.css'
})
export class EditTrip implements OnInit {
  editForm!: FormGroup;
  trip!: Trip;
  submitted = false;
  message = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripData: TripData
  ) {}

  ngOnInit(): void {
    const tripCode = localStorage.getItem('tripCode');

    if (!tripCode) {
      this.router.navigate(['']);
      return;
    }

    this.editForm = this.formBuilder.group({
      _id: [],
      code: [tripCode, Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.tripData.getTrip(tripCode).subscribe({
  next: (value: Trip) => {
    this.trip = value;

    // MongoDB returns a full ISO date, while the HTML date field expects YYYY-MM-DD
    const formTrip = {
      ...this.trip,
      start: this.trip.start
        ? this.trip.start.substring(0, 10)
        : ''
    };

    this.editForm.patchValue(formTrip);
    this.message = `Trip ${tripCode} retrieved.`;
  },
      error: (error: any) => {
        console.error('Error retrieving trip:', error);
        this.message = 'Error retrieving trip.';
      }
    });
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.editForm.valid) {
      this.tripData.updateTrip(this.editForm.value).subscribe({
        next: () => {
          this.router.navigate(['']);
        },
        error: (error: any) => {
          console.error('Error updating trip:', error);
        }
      });
    }
  }
  
  public deleteTrip(): void {
    const tripCode = this.editForm.get('code')?.value;

  if (!tripCode) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete trip ${tripCode}?`
  );

  if (!confirmed) {
    return;
  }

  this.tripData.deleteTrip(tripCode).subscribe({
      next: () => {
      localStorage.removeItem('tripCode');
      this.router.navigate(['']);
      },
      error: (error: any) => {
      console.error('Error deleting trip:', error);
      }
    });
  }

  get f() {
    return this.editForm.controls;
  }
}