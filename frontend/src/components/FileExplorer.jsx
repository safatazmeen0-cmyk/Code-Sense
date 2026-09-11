import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Code2,
} from "lucide-react";

export default function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  isOpen = true,
}) {
  const [isFolderOpen, setIsFolderOpen] = useState(true);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  if (!isOpen) return null;

  function handleStartRename(name, e) {
    e.stopPropagation();
    setEditingFile(name);
    setEditName(name);
  }

  function handleConfirmRename(oldName, e) {
    e.stopPropagation();
    let trimmed = editName.trim();
    if (!trimmed) {
      setEditingFile(null);
      return;
    }
    if (!trimmed.endsWith(".py") && !trimmed.includes(".")) {
      trimmed += ".py";
    }
    onRenameFile(oldName, trimmed);
    setEditingFile(null);
  }

  function handleCancelRename(e) {
    e?.stopPropagation();
    setEditingFile(null);
  }

  function handleStartCreate(e) {
    e.stopPropagation();
    setIsCreating(true);
    setNewFileName("");
  }

  function handleConfirmCreate(e) {
    e.stopPropagation();
    let trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    if (!trimmed.endsWith(".py") && !trimmed.includes(".")) {
      trimmed += ".py";
    }
    onCreateFile(trimmed);
    setIsCreating(false);
    setNewFileName("");
  }

  function handleCancelCreate(e) {
    e?.stopPropagation();
    setIsCreating(false);
    setNewFileName("");
  }

  return (
    <aside className="vscode-explorer" aria-label="File Explorer">
      <div className="explorer-header">
        <span className="explorer-title">EXPLORER</span>
        <button
          className="explorer-icon-btn"
          onClick={handleStartCreate}
          title="New File"
          aria-label="Create new Python file"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="explorer-project">
        <div
          className="project-root"
          onClick={() => setIsFolderOpen(!isFolderOpen)}
          role="button"
          tabIndex={0}
        >
          {isFolderOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {isFolderOpen ? (
            <FolderOpen size={15} className="folder-icon" />
          ) : (
            <Folder size={15} className="folder-icon" />
          )}
          <span className="project-name">CODESENSE</span>
        </div>

        {isFolderOpen && (
          <div className="file-tree">
            {isCreating && (
              <div className="file-item creating">
                <FileCode size={14} className="file-icon-py" />
                <input
                  type="text"
                  className="file-rename-input"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmCreate(e);
                    if (e.key === "Escape") handleCancelCreate(e);
                  }}
                  placeholder="name.py"
                  autoFocus
                />
                <button
                  className="inline-btn"
                  onClick={handleConfirmCreate}
                  title="Create"
                >
                  <Check size={12} />
                </button>
                <button
                  className="inline-btn"
                  onClick={handleCancelCreate}
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {Object.keys(files).map((fileName) => {
              const isActive = fileName === activeFile;
              const isEditing = fileName === editingFile;

              return (
                <div
                  key={fileName}
                  className={`file-item ${isActive ? "active" : ""}`}
                  onClick={() => onSelectFile(fileName)}
                  title={fileName}
                >
                  <FileCode size={14} className="file-icon-py" />

                  {isEditing ? (
                    <div className="rename-inline-form" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        className="file-rename-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmRename(fileName, e);
                          if (e.key === "Escape") handleCancelRename(e);
                        }}
                        autoFocus
                      />
                      <button
                        className="inline-btn"
                        onClick={(e) => handleConfirmRename(fileName, e)}
                        title="Save name"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        className="inline-btn"
                        onClick={handleCancelRename}
                        title="Cancel"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="file-name">{fileName}</span>
                      <div className="file-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="file-action-btn"
                          onClick={(e) => handleStartRename(fileName, e)}
                          title="Rename file"
                        >
                          <Edit2 size={12} />
                        </button>
                        {Object.keys(files).length > 1 && (
                          <button
                            className="file-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile(fileName);
                            }}
                            title="Delete file"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="explorer-footer-info">
        <div className="info-badge">
          <Code2 size={13} />
          <span>Python 3.14 Environment</span>
        </div>
      </div>
    </aside>
  );
}
