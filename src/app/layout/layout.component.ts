import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, NgClass],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isMenuOpen = false;
  loggedInUser:any;
  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  ngOnInit() {
    const user = localStorage.getItem('loggedInUser');  
    if (user) {
      const parsedUser = JSON.parse(user);
      this.loggedInUser = this.capitalizeFirstLetter(parsedUser.username);
    }
  }
  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }
  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
