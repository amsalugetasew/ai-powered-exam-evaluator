import React, { useState, useRef } from 'react';

function FileDropzone({ label, accept, file, onFileChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          dragging
            ? 'border-indigo-500 bg-indigo-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <span>✅</span>
            <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
          </div>
        ) : (
          <div className="text-gray-500">
            <div className="text-2xl mb-1">📄</div>
            <p className="text-sm">Drop file here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files[0] && onFileChange(e.target.files[0])}
      />
    </div>
  );
}

function FileUpload({ onSubmit, loading }) {
  const [questionFile, setQuestionFile] = useState(null);
  const [correctAnswerFile, setCorrectAnswerFile] = useState(null);
  const [studentAnswerFile, setStudentAnswerFile] = useState(null);

  const accept =
    '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ questionFile, correctAnswerFile, studentAnswerFile });
  };

  const isValid = questionFile && correctAnswerFile && studentAnswerFile;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        📎 Upload separate documents for each part. Supported formats: PDF, DOCX, TXT.
      </div>

      <FileDropzone
        label="Question Document"
        accept={accept}
        file={questionFile}
        onFileChange={setQuestionFile}
      />

      <FileDropzone
        label="Correct / Model Answer Document"
        accept={accept}
        file={correctAnswerFile}
        onFileChange={setCorrectAnswerFile}
      />

      <FileDropzone
        label="Student's Answer Document"
        accept={accept}
        file={studentAnswerFile}
        onFileChange={setStudentAnswerFile}
      />

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Evaluating...
          </span>
        ) : (
          '🤖 Evaluate Documents'
        )}
      </button>
    </form>
  );
}

export default FileUpload;
