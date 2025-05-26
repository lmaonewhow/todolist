import React, { useState } from 'react';
import { Todo } from '../types/todo';
import { useTodoStore } from '../store/todoStore';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const { toggleTodo, deleteTodo, editTodo } = useTodoStore();

  const handleEdit = () => {
    if (isEditing && editTitle.trim() !== todo.title) {
      editTodo(todo.id, editTitle.trim());
    }
    setIsEditing(!isEditing);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="todo-checkbox"
      />
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          className="todo-edit-input"
          autoFocus
        />
      ) : (
        <span className="todo-title">{todo.title}</span>
      )}
      <div className="todo-actions">
        <button onClick={handleEdit} className="todo-edit-button">
          {isEditing ? '保存' : '编辑'}
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="todo-delete-button"
        >
          删除
        </button>
      </div>
    </div>
  );
}; 