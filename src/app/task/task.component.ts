import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from '../service/status.service';

@Component({
  selector: 'app-task',
  imports: [NgIf,NgFor, FormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {
  projectId: number | null = null;
  tasks: any[] = [];
  taskData: any = {};
  showModal: boolean = false;
  isEditing: boolean = false;
  editingTaskId:number| null = null;
  searchQuery: string = '';
  selectedStatus: string = '';
  sortField: string = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  
  // taskData = {
  //   title: '',
  //   assignedTo: '',
  //   status: 'Pending',
  //   assignedUser: '',
  //   estimate: '',
  //   timeSpent: ''
  // };

  
  constructor(private route: ActivatedRoute, private router: Router, public statusService: StatusService) {}
  
  

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.projectId = Number(params.get('id'));
      this.loadTasks();
    });
  }
  
  openAddTaskModal() {
    this.isEditing = false;
    this.taskData = { 
      title: '',
      assignedTo: '',
      status: 'Pending', // Default status
      assignedUser: '',
      estimate: '',
      timeSpent: '',
      projectId: this.projectId
    };
    this.showModal = true;
    
  }
  

  editTask(task: any) {
    this.isEditing = true;
    this.showModal = true;
    this.editingTaskId = task.id;
    this.taskData = { ...task };
  }

  loadTasks() {
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    this.tasks = allTasks.filter((task: any) => task.projectId === this.projectId);
  }

  // addTask() {
  //   const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
  //   const newTask = {
  //     id: allTasks.length + 1,
  //     title: this.taskData.title,
  //     assignedTo: this.taskData.assignedTo,
  //     status: this.taskData.status,
  //     assignedUser: this.taskData.assignedUser,
  //     estimate: this.taskData.estimate,
  //     timeSpent: this.taskData.timeSpent,
  //     projectId: this.projectId // Assign the project ID to the task
  //   };
  
  //   allTasks.push(newTask);
  //   localStorage.setItem('tasks', JSON.stringify(allTasks));
  //   this.loadTasks();
  // }
  

  updateStatus(taskId: number, newStatus: string) {
    let allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    allTasks = allTasks.map((task: any) => {
      if (task.id === taskId) {
        task.status = newStatus;
      }
      return task;
    });
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    this.loadTasks();
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      let allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      allTasks = allTasks.filter((task: any) => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(allTasks));
      this.loadTasks();
    }
  }

  saveTask() {
    let allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    if (this.isEditing) {
      
      allTasks = allTasks.map((task: any) =>
        task.id === this.editingTaskId ? { ...task, ...this.taskData } : task
      );
  
      this.isEditing = false;
      this.editingTaskId = null;
    } else {
      const newTask = {
      id: allTasks.length + 1,
      title: this.taskData.title,
      assignedTo: this.taskData.assignedTo,
      status: this.taskData.status,
      assignedUser: this.taskData.assignedUser,
      estimate: this.taskData.estimate,
      timeSpent: this.taskData.timeSpent,
      projectId: this.projectId
    };

    allTasks.push(newTask);
  }

  localStorage.setItem('tasks', JSON.stringify(allTasks)); // Save to LocalStorage
  this.loadTasks(); // Reload tasks to reflect changes
  this.taskData = {}; // Reset form
  this.showModal = false; // Close modal
}
  
//   // // Update task status
//   // updateStatus(task: any, newStatus: string) {
//   //   task.status = newStatus;
//   // }


getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
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
