const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid");


// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const foundUser = users.find(currentElement => currentElement.username === username);
  if (!foundUser) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    });
  }
  request.user = foundUser;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const usernameAlreadyExists = users.find(currentElement => currentElement.username === username);
  if (usernameAlreadyExists) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    });
  }
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const foundUser = users.find(currentElement => currentElement.username === username);
  const newTodo = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    created_at: new Date(),
    done: false,
  };
  foundUser.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id: todoId } = request.params;
  const foundUser = users.find(currentElement => currentElement.username === username);
  const foundTodo = foundUser.todos.find(currentElement => currentElement.id === todoId);
  if (!foundTodo) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }
  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);
  return response.status(200).json(foundTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id: todoId } = request.params;
  const foundUser = users.find(currentElement => currentElement.username === username);
  const foundTodo = foundUser.todos.find(currentElement => currentElement.id === todoId);
  if (!foundTodo) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }
  foundTodo.done = true;
  return response.status(200).json(foundTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id: todoId } = request.params;

  const todoIndex = user.todos.findIndex(currentElement => currentElement.id === todoId);
  if (todoIndex === -1) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }
  user.todos.splice(todoIndex,1);
  return response.status(204).send();
});

module.exports = app;