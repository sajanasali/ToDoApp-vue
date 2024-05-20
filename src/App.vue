<template>
  <div id="app">
    <section class="greeting">
      <h3 class="title">✍️ToDo Application</h3>
    </section>

    <div class="input-section">
      <section class="create-todo">
        <form @submit.prevent="addTodo">
          <h3>What do you plan on doing🙂?</h3>
          <input type="text" placeholder="e.g. email your boss" v-model="text" />
          <input type="text" placeholder="Status" v-model="status" />
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
        <h2 v-show="filteredTodos.length === 0">No Todos Here😞</h2>
        <div class="list">
          <div v-if="filteredTodos.length" class="todo-item-heading">
            <span>Status</span>
            <span>Name</span>
            <span>Created At</span>
            <span>Updated At</span>
            <span>Actions</span>
          </div>

          <div v-for="(todo, index) in filteredTodos" :key="index" :class="`todo-item ${todo.done && 'done'}`">
            <label>
              <input type="checkbox" v-model="todo.done" @change="updateTodoStatus(todo)" />
            </label>
            <div class="todo-content">
              <input type="text" v-model="todo.name" @change="updateTodoName(todo)" />
            </div>
            <div>{{ todo.createdAt }}</div>
            <div>{{ todo.updatedAt }}</div>
            <div class="actions">
              <button class="edit" @click="editTodo">Edit</button>
              <button class="delete" @click="deleteTodoItem(todo)">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

import {db} from './firebase/db.js'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default {
  setup() {
    const todos = ref([]);
    const text = ref('');
    const status = ref('');
    const filterStatus = ref('');

    const fetchTodos = async () => {
      const querySnapshot = await getDocs(collection(db, 'todos'));
      todos.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    };

    const addTodo = async () => {
      if (text.value.trim() === '' || status.value.trim() === '') return;
      const newTodo = {
        name: text.value,
        status: status.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'todos'), newTodo);
      todos.value.unshift({ id: docRef.id, ...newTodo });
      text.value = '';
      status.value = '';
    };

    const updateTodoName = async (todo) => {
      await updateDoc(doc(db, 'todos', todo.id), { name: todo.name, updatedAt: new Date().toISOString() });
      todo.updatedAt = new Date().toISOString();
    };

    const updateTodoStatus = async (todo) => {
      await updateDoc(doc(db, 'todos', todo.id), { done: todo.done, updatedAt: new Date().toISOString() });
      todo.updatedAt = new Date().toISOString();
    };

    const deleteTodoItem = async (todo) => {
      await deleteDoc(doc(db, 'todos', todo.id));
      todos.value = todos.value.filter(t => t.id !== todo.id);
    };

    const filteredTodos = computed(() => {
      if (!filterStatus.value) return todos.value;
      return todos.value.filter(todo => todo.status === filterStatus.value);
    });

    onMounted(() => {
      fetchTodos();
    });

    return {
      todos,
      text,
      status,
      filterStatus,
      addTodo,
      updateTodoName,
      updateTodoStatus,
      deleteTodoItem,
      filteredTodos,
    };
  },
};
</script>

<style scoped>
.todo-item-heading {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  font-weight: bold;
  margin-bottom: 10px;
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
</style>
