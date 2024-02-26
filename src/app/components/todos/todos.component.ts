import { Component, OnInit } from '@angular/core';
import { Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';


@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: Todo = {
    id: '',
    title: '',
    description: '',
    dueDate: new Date(),
    isCompleted: false
  };
  showPopup: boolean = false;
  searchTerm: string = '';
  selectedFilter: string = 'all';
  todoToEdit: Todo | null = null;
  editMode: boolean = false;
  currentPage: number = 1;
  todosPerPage: number = 5; // Number of todos per page
  displayedTodos: Todo[] = [];
  filteredTodos: Todo[] = [];


  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.getAllTodos();
    this.hideAddTodoPopup();
  }

  getAllTodos() {
    this.todoService.getAllTodos()
      .subscribe({
        next: (todos) => {
          this.todos = todos;
          this.updateDisplayedTodos(); // Update filtered todos when todos are fetched
        },
        error: (error) => {
          console.error('Error fetching todos:', error);
        }
      });
  }

  addTodo() {
    this.todoService.addTodo(this.newTodo)
      .subscribe({
        next: (todo) => {
          this.getAllTodos();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error adding todo:', error);
        }
      });
  }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedTodos();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedTodos();
    }
  }
  
  

  showAddTodoPopup() {
    this.showPopup = true;
  }

  hideAddTodoPopup() {
    this.showPopup = false;
  }

  onCompletedChange(id: string, todo: Todo) {
    todo.isCompleted = !todo.isCompleted;
    this.todoService.updateTodo(id, todo)
      .subscribe({
        next: (response) => {
          // No need to refresh all todos, as only one todo is updated
        },
        error: (error) => {
          console.error('Error updating todo:', error);
        }
      });
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id)
      .subscribe({
        next: (response) => {
          this.getAllTodos();
        },
        error: (error) => {
          console.error('Error deleting todo:', error);
        }
      });
  }

  editTodo(todo: Todo) {
    this.todoToEdit = todo;
    this.newTodo = { ...todo };
    this.editMode = true;
    this.showPopup = true;
  }

  updateTodo() {
    if (this.editMode && this.todoToEdit) {
      this.todoService.updateTodo(this.todoToEdit.id, this.newTodo)
        .subscribe({
          next: (response) => {
            this.getAllTodos();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error updating todo:', error);
          }
        });
    }
  }

  resetForm() {
    this.newTodo = {
      id: '',
      title: '',
      description: '',
      dueDate: new Date(),
      isCompleted: false
    };
    this.todoToEdit = null;
    this.editMode = false;
    this.showPopup = false;
  }

  updateDisplayedTodos() {
    let filtered = [...this.todos];
    if (this.searchTerm.trim() !== '') {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.selectedFilter === 'completed') {
      filtered = filtered.filter(todo => todo.isCompleted);
    } else if (this.selectedFilter === 'incompleted') {
      filtered = filtered.filter(todo => !todo.isCompleted);
    }
    this.filteredTodos = filtered;
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.todosPerPage;
    const endIndex = Math.min(startIndex + this.todosPerPage, filtered.length);
    this.displayedTodos = filtered.slice(startIndex, endIndex);
  }
  

  get totalPages(): number {
    return Math.ceil(this.filteredTodos.length / this.todosPerPage);
  }  

  
}