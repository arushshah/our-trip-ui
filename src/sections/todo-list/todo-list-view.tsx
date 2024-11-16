import React, { useEffect, useState } from 'react';
import { Box, Typography, Checkbox, List, ListItem, ListItemText, ListItemIcon, TextField, Button, IconButton } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import {apiUrl} from 'src/config';

interface TodoItem {
  text: string;
  checked: boolean;
  id: string;
}

const initialTodos: TodoItem[] = [

];

export function TodoListView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  // make a call to the backend to get the list of todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips/get-todos?trip_id=${trip_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
        });
        const data = await response.json();
        setTodos(data.todos);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, [trip_id]);

  const handleToggle = (id: string, text: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, checked: !todo.checked } : todo
      )
    );
    const updateTodo = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips/update-todo`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
          body: JSON.stringify({ id, trip_id, text, checked: !todos.find((todo) => todo.id === id)?.checked }),
        });
        if (!response.ok) {
          throw new Error('Failed to update todo');
        }
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    };
    updateTodo();
  };

  const handleEditTodo = (id: string, newText: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  const handleUpdateTodo = (id: string, newText: string) => {
    const updateTodo = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips/update-todo`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
          body: JSON.stringify({ id, trip_id, text: newText, checked: todos.find((todo) => todo.id === id)?.checked }),
        });
        if (!response.ok) {
          throw new Error('Failed to update todo');
        }
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    };
    updateTodo();
  }

  const handleDelete = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    const deleteTodo = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips/delete-todo`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
          body: JSON.stringify({ id, trip_id }),
        });
        if (!response.ok) {
          throw new Error('Failed to delete todo');
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    };
    deleteTodo();
  };

  const handleAddTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: TodoItem = {
      id: uuidv4(),
      text: newTodo,
      checked: false,
    };
    setTodos((prevTodos) => [...prevTodos, newTodoItem]);
    setNewTodo('');
    // make a call to the backend to add the new todo
    const addTodo = async () => {
      try {
      const response = await fetch(`${apiUrl}/trips/add-todo`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('idToken')}`,
        },
        body: JSON.stringify({ ...newTodoItem, trip_id }),
      });
      if (!response.ok) {
        throw new Error('Failed to add todo');
      }
      const data = await response.json();
      } catch (error) {
      console.error('Error adding todo:', error);
      }
    };
    addTodo();
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedTodos = Array.from(todos);
    const [movedTodo] = reorderedTodos.splice(result.source.index, 1);
    reorderedTodos.splice(result.destination.index, 0, movedTodo);
    setTodos(reorderedTodos);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleKeyPressEdit = (event: React.KeyboardEvent, id: string, newText: string) => {
    if (event.key === 'Enter') {
      handleUpdateTodo(id, newText);
    }
  }
  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#222831', // Set your desired background color here
          color: '#EEEEEE',
          padding: 3,
          overflowY: 'auto', // Make the view scrollable
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          Action Items
        </Typography>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(droppableProvided) => (
              <List {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
                {todos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                    {(draggableProvided) => (
                      <ListItem
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        disablePadding
                      >
                        <IconButton edge="start" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                          <DeleteIcon sx={{ color: '#DC3545' }} />
                        </IconButton>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={todo.checked}
                            tabIndex={-1}
                            disableRipple
                            onClick={() => handleToggle(todo.id, todo.text)}
                            sx={{
                              color: '#20C997',
                              '&.Mui-checked': {
                                color: '#20C997',
                              },
                            }}
                          />
                        </ListItemIcon>
                        <TextField
                          value={todo.text}
                          onChange={(e) => handleEditTodo(todo.id, e.target.value)}
                          onBlur={() => handleUpdateTodo(todo.id, todo.text)}
                          onKeyPress={(e) => handleKeyPressEdit(e, todo.id, todo.text)}
                          variant="standard"
                          sx={{
                            flex: 1,
                            borderRadius: 1,
                            input: { color: '#EEEEEE' },
                          }}
                          InputProps={{
                            disableUnderline: true
                          }}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
                <ListItem>
                  <TextField
                    variant="outlined"
                    placeholder="Add new to-do"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={handleKeyPress}
                    inputProps={{
                      style: { color: '#EEEEEE' },
                      maxLength: 500,
                    }}
                    sx={{
                      mr: 2,
                      borderRadius: 1,
                      height: '56px',
                      width: '50%',
                    }} 
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddTodo}
                    sx={{
                      backgroundColor: '#20C997',
                      '&:hover': {
                        backgroundColor: '#17A589',
                      },
                      height: '30px', // Same height as the TextField
                    }}
                  >
                    Add
                  </Button>
                </ListItem>
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </>
  );
}

export default TodoListView;