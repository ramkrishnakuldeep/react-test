import React from 'react';

function PageSizeSelector({ pageSize, onPageSizeChange, loading }) {
  return (
    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="pageSize" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
        Items per page:
      </label>
      <select
        id="pageSize"
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        disabled={loading}
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: loading ? '#f8f9fa' : 'white',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
}

export default PageSizeSelector;
