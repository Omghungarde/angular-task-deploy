import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from '../service/status.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-task',
  imports: [NgIf,NgFor, FormsModule,NgClass],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {
  projectId: number | null = null;
  tasks: any[] = [];
  allProjectTasks: any[] = [];
  taskData: any = {};
  showModal: boolean = false;
  isEditing: boolean = false;
  editingTaskId:number| null = null;
  searchQuery: string = '';
  selectedStatus: string = '';
  sortField: string = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';
  notification: string = '';
  notificationType: string = '';
  formSubmitted = false;
  submitted = false;

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
      status: 'Pending', 
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
    this.allProjectTasks = allTasks.filter((task: any) => task.projectId === this.projectId);
    this.tasks = [...this.allProjectTasks];
  }

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

  

deleteTask(taskId: number | string) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      const tasksFromStorage = localStorage.getItem('tasks') || '[]';
      let allTasks = JSON.parse(tasksFromStorage);
      allTasks = allTasks.filter((task: any) => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(allTasks));
      this.loadTasks();

      Swal.fire({
        icon: 'success',
        title: 'Task deleted!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  });
}

saveTask() {
  this.formSubmitted = true;
  let allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

  if (this.isEditing) {

    allTasks = allTasks.map((task: any) =>
      task.id === this.editingTaskId ? { ...task, ...this.taskData } : task
    );
    Swal.fire({
      icon: 'success',
      title: 'Task updated successfully!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  } else {
    const newId = allTasks.length ? Math.max(...allTasks.map((t: any) => t.id)) + 1 : 1;
    const newTask = {
      id: newId,
      ...this.taskData,
      projectId: this.projectId
    };
    allTasks.push(newTask);
    Swal.fire({
      icon: 'success',
      title: 'Task added successfully!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  this.loadTasks();
  this.taskData = {};
  this.showModal = false;
  this.isEditing = false;
  this.editingTaskId = null;
  this.formSubmitted = false;
}

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

filterTasks() {
  this.searchTasks();
}

searchTasks() {
  const rawTasks = this.statusService.getTasks();

  let filtered = rawTasks.filter(task => task.projectId === this.projectId);

  if (this.selectedStatus) {
    filtered = filtered.filter(task => task.status === this.selectedStatus);
  }

  if (this.searchQuery.trim()) {
    const query = this.searchQuery.trim().toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.assignedTo.toLowerCase().includes(query) ||
      task.assignedUser.toLowerCase().includes(query)
    );
  }

  this.tasks = filtered;
}

sortTasks() {
  this.tasks = this.statusService.sortTasksBy(this.sortField, this.sortOrder);
}

onsubmit(form:NgForm){
  this.submitted=true;

  if(form.valid){
    this.saveTask();
  }
}
draggedTask: any;

onDragStart(event: DragEvent, task: any) {
  this.draggedTask = task;
  event.dataTransfer?.setData('text/plain', JSON.stringify(task));
}

onDragOver(event: DragEvent) {
  event.preventDefault(); 
}

onDrop(event: DragEvent, targetTask: any) {
  event.preventDefault();

  if (!this.draggedTask || this.draggedTask.id === targetTask.id) return;

  const draggedIndex = this.tasks.findIndex(t => t.id === this.draggedTask.id);
  const targetIndex = this.tasks.findIndex(t => t.id === targetTask.id);

  const updatedTasks = [...this.tasks];
  const [movedTask] = updatedTasks.splice(draggedIndex, 1);
  updatedTasks.splice(targetIndex, 0, movedTask);

  this.tasks = updatedTasks;
  this.saveTaskOrder();
}

saveTaskOrder() {
  localStorage.setItem('tasks', JSON.stringify(this.tasks));
}

}
