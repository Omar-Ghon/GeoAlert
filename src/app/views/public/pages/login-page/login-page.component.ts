import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  errorMessage = '';

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  loginAsOperator(): void {
    const username = this.loginForm.controls.username.value.trim();
    const password = this.loginForm.controls.password.value.trim();

    if (username === 'operator' && password === 'password') {
      this.errorMessage = '';
      return;
    }

    this.errorMessage = 'Incorrect password';
  }

  loginAsAdministrator(): void {
    const username = this.loginForm.controls.username.value.trim();
    const password = this.loginForm.controls.password.value.trim();

    if (username === 'admin' && password === 'password') {
      this.errorMessage = '';
      return;
    }

    this.errorMessage = 'Incorrect password';
  }
}