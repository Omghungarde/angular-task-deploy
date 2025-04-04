import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private tasks: any[] = [];

  constructor() {
    this.loadTasks();
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
    return this.tasks.filter(task =>
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.assignedUser.toLowerCase().includes(query.toLowerCase())
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
}
