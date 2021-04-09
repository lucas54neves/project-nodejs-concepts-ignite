const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const existsUserAccount = users.find(user => user.username === username)

  if (!existsUserAccount) {
    return response.status(404).json({ error: 'User does not exists' })
  }
  
  request.user = existsUserAccount
  
  return next()
}

function findTodo(todos, id) {
  const todo = todos.find(todo => todo.id === id)

  return todo
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const existsUserAccount = users.find(user => user.username === username)

  if (existsUserAccount) {
    return response.status(400).json({
      error: 'User already exist'
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body

  const { user } = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { id } = request.params

  const { user } = request

  const todo = findTodo(user.todos, id)

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }

  todo.title = title

  todo.deadline = deadline

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const todo = findTodo(user.todos, id)

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }

  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const todo = findTodo(user.todos, id)

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;