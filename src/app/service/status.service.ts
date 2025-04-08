import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private tasks: any[] = [];
  private projects: any[] = [];
  private loggedInUser: any;
  constructor() {
    this.loadTasks();
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
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

  searchTasks(query: string, projectId: number): any[] {
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  return allTasks.filter((task: any) =>
    task.projectId === projectId &&
    task.title.toLowerCase().includes(query.toLowerCase())
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
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
  this.projects = allProjects.filter((p: any) => p.createdBy === this.loggedInUser.username);
  }

  private saveProjects() {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }
  getProjects() {
    return this.projects;
  }
  filterProjectsByStatus(status: string, username: string) {
    return this.getProjectsByUser(username).filter((p: any) =>
      status ? p.status === status : true
    );
  }

  searchProjects(query: string, username: string) {
    return this.getProjectsByUser(username).filter((project: any) =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.createdBy.toLowerCase().includes(query.toLowerCase())
    );
  }  

  sortProjectsBy(field: string, order: 'asc' | 'desc', username: string) {
    const projects = this.getProjectsByUser(username);
    return projects.sort((a: any, b: any) => {
      if (field === 'startDate') {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      if (field === 'title' || field === 'projectName') {
        return order === 'asc'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      return 0;
    });
  }
  
  getProjectsByUser(username: string) {
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    return allProjects.filter((p: any) => p.createdBy === username);
  }
   
}
