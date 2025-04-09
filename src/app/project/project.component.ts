import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusService } from '../service/status.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-project',
  imports:[FormsModule,NgFor,NgIf,NgClass],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  projects: any[] = [];
  loggedInUser: any;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingProjectId: number | null = null;
  selectedStatus: string = '';
  sortField: string = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  searchQuery: string = '';
  notification: string = '';
  notificationType: string = '';
  dateError = false;
  submitted=false;
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
    this.projects = allProjects.filter((project: any) => project.createdBy === this.loggedInUser.username)
    .map((project: any) => ({
      ...project,
      dueDays: this.calculateDueDays(project.endDate)  // Calculate dueDays dynamically
    }));
    this.projects = this.statusService.getProjectsByUser(this.loggedInUser.username)
    .map((p: any) => ({
      ...p,
      dueDays: this.calculateDueDays(p.endDate)
    }));
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
  if (
    !this.projectData.title ||
    !this.projectData.description ||
    !this.projectData.startDate ||
    !this.projectData.endDate ||
    !this.projectData.teamMembers
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Please fill in all required fields.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
    return;
  }

  const start = new Date(this.projectData.startDate);
  const end = new Date(this.projectData.endDate);
  if (start > end) {
    Swal.fire({
      icon: 'error',
      title: 'Start date must be before or equal to end date.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
    return;
  }

  let allProjects = JSON.parse(localStorage.getItem('projects') || '[]');

  if (this.isEditing && this.editingProjectId !== null) {
    // Update project
    allProjects = allProjects.map((p: any) => {
      if (p.id === this.editingProjectId) {
        return {
          ...p,
          ...this.projectData,
          teamMembers: this.projectData.teamMembers.split(',').map(m => m.trim())
        };
      }
      return p;
    });

    Swal.fire({
      icon: 'success',
      title: 'Project updated successfully!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } else {
    // Add new project
    const newProject = {
      id: allProjects.length ? Math.max(...allProjects.map((p: { id: number }) => p.id)) + 1 : 1,
      ...this.projectData,
      createdBy: this.loggedInUser.username,
      teamMembers: this.projectData.teamMembers.split(',').map(m => m.trim()),
      dueDate: this.projectData.dueDate || new Date().toISOString().split('T')[0]
    };
    allProjects.push(newProject);

    Swal.fire({
      icon: 'success',
      title: 'Project added successfully!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

  // Save and reload
  localStorage.setItem('projects', JSON.stringify(allProjects));
  this.showModal = false;
  this.loadProjects();
}

  

deleteProject(projectId: number) {
  Swal.fire({
    title: 'Are you sure?',
    text: "This will permanently delete the project!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      let allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      allProjects = allProjects.filter((project: any) => project.id !== projectId);
      localStorage.setItem('projects', JSON.stringify(allProjects));
      this.loadProjects();

      Swal.fire({
        icon: 'success',
        title: 'Project deleted successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  });
}
  openTask(projectId: number) {
    this.router.navigate(['/task', projectId]);
  }

  calculateDueDays(endDate: string): string {
  if (!endDate) return 'N/A';

  // Parse endDate safely
  const endParts = endDate.split('-');
  if (endParts.length !== 3) return 'Invalid date';

  const [year, month, day] = endParts.map(Number);
  const end = new Date(year, month - 1, day); // JS months are 0-based
  end.setHours(0, 0, 0, 0); // Normalize to start of day

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day

  const diffInMs = end.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (daysLeft === 0) return 'Due Today';
  if (daysLeft > 0) return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
  return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''}`;
}

  
  filterProjects() {
    this.searchProjects();
  }
  searchProjects() {
    const allProjects = this.statusService.getProjects();
    
    let filtered = allProjects.filter(project => project.createdBy === this.loggedInUser.username);
    if (this.selectedStatus) {
      filtered = filtered.filter(project => project.status === this.selectedStatus);
    }
  
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(query) ||
        project.createdBy?.toLowerCase().includes(query)
      );
    }
  
    this.projects = filtered.map(project => ({
      ...project,
      dueDays: this.calculateDueDays(project.endDate)
    }));
  }
    sortProjects() {
      const sorted = this.statusService.sortProjectsBy(this.sortField, this.sortOrder, this.loggedInUser.username);
      this.projects = sorted.map((project:any) => ({
        ...project,
        dueDays: this.calculateDueDays(project.endDate)
      }));
    }
  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortProjects();
  }
  sortProjectsBy(field: string, order: 'asc' | 'desc', createdBy: string): any[] {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const userProjects = allProjects.filter((p:any) => p.createdBy === createdBy);
  
    const sortedProjects = userProjects.sort((a:any, b:any) => {
      const valA = a[field] || '';
      const valB = b[field] || '';
  
      if (field === 'startDate') {
        return order === 'asc'
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      }
  
      return order === 'asc'
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });
    return sortedProjects;
  }

  onsubmit(form:NgForm){
    this.submitted=true;
  
    if(form.valid){
      this.saveProject();
    }
  }
  draggedProject: any = null;
dragOverProjectId: number | null = null;

onProjectDragStart(event: DragEvent, project: any) {
  this.draggedProject = project;
  event.dataTransfer?.setData('text/plain', JSON.stringify(project));
}

onProjectDragOver(event: DragEvent, project: any) {
  event.preventDefault();
  this.dragOverProjectId = project.id;
}

onProjectDrop(event: DragEvent, targetProject: any) {
  event.preventDefault();
  this.dragOverProjectId = null;

  if (!this.draggedProject || this.draggedProject.id === targetProject.id) return;

  const draggedIndex = this.projects.findIndex(p => p.id === this.draggedProject.id);
  const targetIndex = this.projects.findIndex(p => p.id === targetProject.id);

  const updatedProjects = [...this.projects];
  const [movedProject] = updatedProjects.splice(draggedIndex, 1);
  updatedProjects.splice(targetIndex, 0, movedProject);

  this.projects = updatedProjects;
  this.saveProjectOrder(); // Save new order to localStorage
}

saveProjectOrder() {
  localStorage.setItem('projects', JSON.stringify(this.projects));
}

}
