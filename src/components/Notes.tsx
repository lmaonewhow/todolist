import React, { useState } from 'react';
import { useNotesStore, Note } from '../store/notesStore';
import '../styles/notes.css';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newReflection, setNewReflection] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editReflection, setEditReflection] = useState('');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  // 新建笔记
  const handleAdd = () => {
    if (newTitle.trim() || newContent.trim() || newReflection.trim()) {
      addNote(
        newTitle.trim() || '无标题',
        newContent.trim(),
        newReflection.trim()
      );
      setNewTitle('');
      setNewContent('');
      setNewReflection('');
    }
  };

  // 编辑笔记
  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditReflection(note.reflection || '');
  };

  // 保存编辑
  const handleSave = () => {
    if (editingNote) {
      updateNote(editingNote.id, editTitle, editContent, editReflection);
      setEditingNote(null);
    }
  };

  // 删除笔记
  const handleDelete = (id: string) => {
    setShowConfirm(id);
  };
  const confirmDelete = () => {
    if (showConfirm) deleteNote(showConfirm);
    setShowConfirm(null);
  };

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div className="new-note-form">
          <input
            className="note-title-input"
            placeholder="新建笔记标题..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea
            className="note-content-input"
            placeholder="内容..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <textarea
            className="note-reflection-input"
            placeholder="感悟..."
            value={newReflection}
            onChange={e => setNewReflection(e.target.value)}
          />
          <button 
            className="add-note-btn" 
            onClick={handleAdd} 
            disabled={!newTitle.trim() && !newContent.trim() && !newReflection.trim()}
          >
            添加笔记
          </button>
        </div>
      </div>

      <div className="notes-list">
        {notes.length === 0 && <div className="notes-empty">暂无笔记，快来记录吧！</div>}
        {notes.map(note => (
          <div className="note-card" key={note.id}>
            <div className="note-card-main" onClick={() => handleEdit(note)}>
              <div className="note-title">{note.title}</div>
              <div className="note-preview-section">
                <div className="note-section">
                  <div className="section-label">内容：</div>
                  <div className="note-content-preview">
                    {note.content.slice(0, 60) || <span className="note-empty">（无内容）</span>}
                  </div>
                </div>
                <div className="note-section">
                  <div className="section-label">感悟：</div>
                  <div className="note-reflection-preview">
                    {note.reflection?.slice(0, 60) || <span className="note-empty">（无感悟）</span>}
                  </div>
                </div>
              </div>
              <div className="note-time">{new Date(note.updatedAt).toLocaleString()}</div>
            </div>
            <button className="delete-note-btn" onClick={() => handleDelete(note.id)}>删除</button>
          </div>
        ))}
      </div>

      {/* 编辑弹窗 */}
      {editingNote && (
        <div className="note-modal-mask" onClick={() => setEditingNote(null)}>
          <div className="note-modal" onClick={e => e.stopPropagation()}>
            <input
              className="note-title-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="标题"
              autoFocus
            />
            <textarea
              className="note-content-input"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              placeholder="内容"
              rows={6}
            />
            <textarea
              className="note-reflection-input"
              value={editReflection}
              onChange={e => setEditReflection(e.target.value)}
              placeholder="感悟"
              rows={4}
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>保存</button>
              <button className="cancel-btn" onClick={() => setEditingNote(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showConfirm && (
        <div className="note-modal-mask" onClick={() => setShowConfirm(null)}>
          <div className="note-modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-text">确定要删除这条笔记吗？</div>
            <div className="modal-actions">
              <button className="delete-btn" onClick={confirmDelete}>删除</button>
              <button className="cancel-btn" onClick={() => setShowConfirm(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 