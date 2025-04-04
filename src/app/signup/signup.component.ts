import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  signupMessage: string = '';

  constructor(private router: Router) {}
  
  signUp() {
    if (!this.user.username || !this.user.email || !this.user.password || !this.user.confirmPassword) {
      this.signupMessage = 'All fields are required!';
      return;
    }
    if (this.user.password.length < 6) {
      this.signupMessage = 'Password must be at least 6 characters!';
      return;
    }
    if (this.user.password !== this.user.confirmPassword) {
      this.signupMessage = 'Passwords do not match!';
      return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let userExists = users.some((u: any) => u.username === this.user.username);

    if (userExists) {
      this.signupMessage = 'Username already exists!';
      return;
    }
    users.push({ ...this.user });
    localStorage.setItem('users', JSON.stringify(users));

    this.signupMessage = 'Signup successful! Redirecting to login...';

    
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }

}
