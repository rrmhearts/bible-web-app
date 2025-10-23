import React from 'react';
import { X } from 'lucide-react';
import './Panel.css';

const PDFPanel = ({ url, onClose }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <span style={{ fontWeight: '600' }}>PDF Document</span>
        <button
          onClick={onClose}
          className="nav-button"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="panel-content">
        <iframe
          src={url}
          style={{ width: '100%', height: '100%', border: 0 }}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};

export default PDFPanel;