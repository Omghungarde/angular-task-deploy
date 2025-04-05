import { Component, OnInit } from '@angular/core';
import { StatusService } from '../service/status.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports:[RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedInUser = '';
  totalProjects = 0;
  activeProjects = 0;

  constructor(private statusService: StatusService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    this.loggedInUser = user.username || 'User';

    const userProjects = this.statusService.getProjectsByUser(this.loggedInUser);
    this.totalProjects = userProjects.length;

    this.activeProjects = userProjects.filter((p: any) =>
      p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'overdue'
    ).length;
  }
}
