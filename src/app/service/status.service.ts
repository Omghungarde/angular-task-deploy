import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private tasks: any[] = [];
  private projects: any[] = [];
  constructor() {
    this.loadTasks();
    this.loadProjects();
  }

  private loadTasks() {
    this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  }

  private saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  getTasks() {
    return this.tasks;
  }

  addTask(newTask: any) {
    newTask.id = this.tasks.length + 1;
    this.tasks.push(newTask);
    this.saveTasks();
  }

  editTask(updatedTask: any) {
    this.tasks = this.tasks.map(task =>
      task.id === updatedTask.id ? { ...task, ...updatedTask } : task
    );
    this.saveTasks();
  }

  deleteTask(taskId: number) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
  }

  updateStatus(taskId: number, newStatus: string) {
    this.tasks = this.tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    this.saveTasks();
  }

  filterByStatus(status: string) {
    return status ? this.tasks.filter(task => task.status === status) : this.tasks;
  }

  searchTasks(query: string) {
    if (!query.trim()) {
      return this.projects; // Return all projects if search is empty
    }
  
    query = query.toLowerCase(); // Case-insensitive search
  
    return this.projects.filter(project =>
      (project.title && project.title.toLowerCase().includes(query)) || 
      (project.createdBy && project.createdBy.toLowerCase().includes(query)) 
    );
  }
  

  sortTasksBy(field: string, order: 'asc' | 'desc') {
    return this.tasks.sort((a, b) => {
      if (field === 'date' || field === 'projectName') {
        const valA = a[field] || '';
        const valB = b[field] || '';
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge rounded-pill bg-warning';
      case 'pending(task)':
        return 'badge rounded-pill bg-danger';
      case 'in progress':
        return 'badge rounded-pill bg-warning';
      case 'completed':
        return 'badge rounded-pill bg-success';
      case 'overdue':
        return 'badge rounded-pill bg-danger'; 
      default:
        return 'badge rounded-pill bg-secondary';
    }
  }
  private loadProjects() {
    this.projects = JSON.parse(localStorage.getItem('projects') || '[]');
  }

  private saveProjects() {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }
  getProjects() {
    return this.projects;
  }

  // 🟢 STEP 1: FILTER PROJECTS BY STATUS
  filterProjectsByStatus(status: string) {
    return status ? this.projects.filter(proj => proj.status.toLowerCase() === status.toLowerCase()) : this.projects;
  }

  // 🟢 STEP 2: SEARCH PROJECTS
  searchProjects(query: string) {
    query = query.toLowerCase().trim();
  
    if (!query) {
      return this.getProjects(); // Return all if no search input
    }
  
    return this.projects.filter(proj =>
      (proj.title && proj.title.toLowerCase().includes(query)) ||
      (proj.assignedUser && proj.assignedUser.toLowerCase().includes(query))
    );
  }
  

  // 🟢 STEP 3: SORT PROJECTS
  // sortProjectsBy(field: string, order: 'asc' | 'desc') {
  //   return this.projects.sort((a, b) => {
  //     let valA = a[field];
  //   let valB = b[field];

  //   if (!valA) valA = ''; // Handle missing values
  //   if (!valB) valB = '';

  //   // Fixing date sorting issue
  //   if (field === 'date') {
  //     let dateA = new Date(valA);
  //     let dateB = new Date(valB);

  //     if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
  //       console.warn("Invalid date format", valA, valB);
  //       return 0; // If date is invalid, keep the original order
  //     }

  //     return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  //   }

  //   // ✅ Sorting by string (e.g., project name)
  //   if (typeof valA === 'string' && typeof valB === 'string') {
  //     return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  //   }

  //   return 0;
  // });
    
  // }

  sortProjectsBy(field: string, order: 'asc' | 'desc') {
    return this.projects.sort((a, b) => {
      if (!a || !b || !a[field] || !b[field]) return 0; // Prevent errors
  
      if (field === 'startDate') {
        let dateA = new Date(a.startDate).getTime();
        let dateB = new Date(b.startDate).getTime();
  
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        let valA = a[field].toString().toLowerCase();
        let valB = b[field].toString().toLowerCase();
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
    });
  }
  
  
  
  
}
