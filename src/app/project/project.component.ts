import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusService } from '../service/status.service';

@Component({
  selector: 'app-project',
  imports:[FormsModule,NgFor,NgIf],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  projects: any[] = [];
  loggedInUser: any;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingProjectId: number | null = null;

  projectData = {
    title: '',
    description: '',
    status: 'Pending',
    programManager: '',
    projectManager: '',
    startDate: '',
    dueDate: '',
    endDate: '',
    teamMembers: ''
  };

  constructor(private router: Router, public statusService:StatusService) {}

  ngOnInit() {
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

    if (!this.loggedInUser.email) {
      alert('Please log in first!');
      this.router.navigate(['/login']);
      return;
    }

    this.loadProjects();
  }

  loadProjects() {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    this.projects = allProjects.filter((project: any) => project.createdBy === this.loggedInUser.username);
  }

  openModal(edit: boolean, project?: any) {
    this.showModal = true;
    this.isEditing = edit;

    if (edit && project) {
      this.editingProjectId = project.id;
      this.projectData = { ...project, teamMembers: project.teamMembers.join(', ') };
    } else {
      this.editingProjectId = null;
      this.projectData = { title: '', description: '', status: 'Pending', programManager: '', projectManager: '', startDate: '', dueDate: '', endDate: '', teamMembers: '' };
    }
  }

  saveProject() {
    if (!this.projectData.title || !this.projectData.description) {
      alert('Please fill in all required fields.');
      return;
    }

    let allProjects = JSON.parse(localStorage.getItem('projects') || '[]');

    if (this.isEditing && this.editingProjectId !== null) {
      allProjects = allProjects.map((p: any) => {
        if (p.id === this.editingProjectId) {
          return { ...p, ...this.projectData, teamMembers: this.projectData.teamMembers.split(',').map(m => m.trim()) };
        }
        return p;
      });
    } else {
      const newProject = {
        id: allProjects.length ? Math.max(...allProjects.map((p: { id: number }) => p.id)) + 1 : 1,
        ...this.projectData,
        createdBy: this.loggedInUser.username,
        teamMembers: this.projectData.teamMembers.split(',').map(m => m.trim())
      };
      allProjects.push(newProject);
    }

    localStorage.setItem('projects', JSON.stringify(allProjects));
    this.showModal = false;
    this.loadProjects();
  }

  deleteProject(projectId: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      let allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      allProjects = allProjects.filter((project: any) => project.id !== projectId);
      localStorage.setItem('projects', JSON.stringify(allProjects));
      this.loadProjects();
    }
  }

  openTask(projectId: number) {
    this.router.navigate(['/task', projectId]);
  }
  
  calculateDueDays(dueDate: string): string {
    if (!dueDate) return 'N/A';
  
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
    return daysLeft >= 0 ? `${daysLeft} days left` : `Overdue by ${Math.abs(daysLeft)} days`;
  }
  

}
