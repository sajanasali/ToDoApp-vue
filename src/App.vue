<!-- eslint-disable no-mixed-spaces-and-tabs -->
<!-- eslint-disable no-mixed-spaces-and-tabs -->

<template>
  <div id="app">
    <section class="greeting">
      <h3 class="title">✍️ ToDo Application</h3>
    </section>

    <div class="input-section">
      <section class="create-todo">
        <form @submit.prevent="addTodo">
          <h3>What do you plan on doing 🙂?</h3>
          <input type="text" placeholder="e.g. email your boss" v-model="text" />
          <input type="submit" value="Add todo" />
        </form>
      </section>
    </div>

    <div class="filter-section">
      <select v-model="filterStatus">
        <option value="">All</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
    </div>

    <div class="todo-section">
      <section class="todo-list">
        <h2 v-show="filteredTodos.length === 0">No Todos Here 😞</h2>
        <div class="list">
          <div v-if="filteredTodos.length" class="todo-item-heading">
            <span>Status</span>
            <span>Name</span>
            <span>Created At</span>
            <span>Updated At</span>
            <span>Actions</span>
          </div>

          <div v-for="(todo, index) in filteredTodos" :key="index" :class="`todo-item ${todo.done && 'done'}`">
           <div class='todo-detail'>
		    <div>
              <input type="checkbox" v-model="todo.done" @change="toggleTodoStatus(todo)" />
            </div>
            <div class="todo-content">
              <input type="text" v-model="todo.name" @change="updateTodoName(todo)" />
            </div>
            <div>{{ new Date(todo.createdAt).toLocaleString() }}</div>
            <div>{{ new Date(todo.updatedAt).toLocaleString() }}</div>
			</div>
            <div class="actions">
              <button  :disabled="todo.status === 'Completed' || isEditing(todo.id)"  class="edit" @click="editTodo(todo)">Edit</button>
			  <!-- Editing form -->
      <div v-if="editedTodo !== null && todo.id === editedTodo.id">
        
		<div class="edit-buttons">
        <button @click="updateTodoName(editedTodo)">Update</button>
		<button @click="cancelTodo()">Cancel</button>
		</div>
      </div>
              <button  :disabled="todo.status === 'Completed'"  class="delete" @click="deleteTodoItem(todo)">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>


<script>
import { ref, computed, onMounted } from 'vue';
import { db } from './firebase/db.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default {
  setup() {
    const todos = ref([]);
    const text = ref('');
    const filterStatus = ref('');
	const editedTodoId = ref(null);
	const editedTodo=ref(null)

    const fetchTodos = async () => {
      const querySnapshot = await getDocs(collection(db, 'todos'));
      todos.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    };

    const addTodo = async () => {
      if (text.value.trim() === '') return;
      const newTodo = {
        name: text.value,
        status: 'Pending',
        done: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'todos'), newTodo);
      todos.value.unshift({ id: docRef.id, ...newTodo });
      text.value = '';
    };

   const updateTodoName = async (todo) => {
  await updateDoc(doc(db, 'todos', todo.id), { name: todo.name, updatedAt: new Date().toISOString() });
  todo.updatedAt = new Date().toISOString();
  editedTodo.value = null; // Reset editedTodo after updating
};
     
    const isEditing = (todoId) => {
            return editedTodoId.value === todoId;
        };
	const editTodo = async(todo) => {
         editedTodo.value = { ...todo };
    };
    const toggleTodoStatus = async (todo) => {
      todo.status = todo.done ? 'Completed' : 'Pending';
      await updateDoc(doc(db, 'todos', todo.id), { done: todo.done, status: todo.status, updatedAt: new Date().toISOString() });
      todo.updatedAt = new Date().toISOString();
    };

    const deleteTodoItem = async (todo) => {
      await deleteDoc(doc(db, 'todos', todo.id));
      todos.value = todos.value.filter((t) => t.id !== todo.id);
    };

    const filteredTodos = computed(() => {
      if (!filterStatus.value) return todos.value;
      return todos.value.filter((todo) => todo.status === filterStatus.value);
    });
   const cancelTodo=()=>{
   editedTodo.value=null
   }

    onMounted(() => {
      fetchTodos();
    });

    return {
      todos,
      text,
      filterStatus,
      addTodo,
      updateTodoName,
      toggleTodoStatus,
      deleteTodoItem,
      filteredTodos,
    editedTodo,
	editTodo,
	cancelTodo,
	isEditing
    };
  },
};
</script>


<style scoped>
.todo-item-heading {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  font-weight: bold;
  margin:auto
 
}


.todo-detail {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  font-weight: bold;
  margin:auto
 
}
.todo-detail span {
  padding: 8px;
}
.todo-item-heading span {
  padding: 8px;
}

.todo-item {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  margin-bottom: 5px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 12px;
  background-color: #f44336;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;;
}
.edit-buttons{
display: flex;
padding: 8px 12px;
margin:auto;
  color: #ffffff;
  border: none;

  cursor: pointer;
  transition: background-color 0.3s ease;

}

.actions button:hover {
  background-color: #d32f2f;
}

.edit {
  background-color: #4caf50;
}

.edit:hover {
  background-color: #388e3c;
}
.filter-section  {
  padding: 10px;
  width:200px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: black;
  margin-left:40px;
  background-color: white; /* Set white background */
}
.input-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-todo {
  width: 500px;
}
.greeting{
align-items: center;
display: flex;
  justify-content: center;
}
.edit.disabled {
  background-color: #ccc; /* Change to desired color for disabled button */
  cursor: not-allowed; /* Change cursor to indicate the button is disabled */
}
.delete.disabled {
  background-color: #ccc; /* Change to desired color for disabled button */
  cursor: not-allowed; /* Change cursor to indicate the button is disabled */
}
</style>
