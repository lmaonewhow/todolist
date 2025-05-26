import React, { useState } from 'react';
import { useTodoStore } from '../store/todoStore';

export const AddTodo: React.FC = () => {
  const [title, setTitle] = useState('');
  const addTodo = useTodoStore((state) => state.addTodo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTodo(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="添加新的待办事项..."
        className="add-todo-input"
      />
      <button type="submit" className="add-todo-button">
        添加
      </button>
    </form>
  );
}; 