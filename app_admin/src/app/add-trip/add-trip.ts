import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { TripData } from '../trip-data';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-trip.html',
  styleUrl: './add-trip.css'
})
export class AddTrip {
  addForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripData: TripData
  ) {
    this.addForm = this.formBuilder.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Za-z0-9]+$/)
        ]
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      length: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],
      start: [
        '',
        Validators.required
      ],
      resort: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      perPerson: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],
      image: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(1000)
        ]
      ]
    });
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.addForm.valid) {
      this.tripData.addTrip(this.addForm.value).subscribe({
        next: () => {
          this.router.navigate(['']);
        },
        error: (error: any) => {
          console.error('Error adding trip:', error);
        }
      });
    }
  }

  get f() {
    return this.addForm.controls;
  }
}