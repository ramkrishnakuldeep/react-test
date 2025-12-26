import React from 'react';

function Pagination({ pagination, onPageChange, loading }) {
  const { 
    page = 1, 
    totalPages = 0, 
    hasNext = false, 
    hasPrev = false, 
    totalItems = 0 
  } = pagination || {};


  // Don't show pagination if we don't have valid data
  if (!pagination || totalPages <= 1 || totalItems === 0) {
    return null;
  }

  // Generate page numbers to display (show current page and 2 pages on each side)
  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const buttonStyle = (isActive, isDisabled) => ({
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid #007bff',
    backgroundColor: isActive ? '#007bff' : isDisabled ? '#e9ecef' : 'white',
    color: isActive ? 'white' : isDisabled ? '#6c757d' : '#007bff',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    minWidth: '40px'
  });

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '0.25rem',
      margin: '1rem 0',
      padding: '1rem',
    }}>
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1 || loading}
        style={buttonStyle(false, page === 1 || loading)}
      >
        First
      </button>
      
      {/* Previous Page */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev || loading}
        style={buttonStyle(false, !hasPrev || loading)}
      >
        ‹
      </button>
      
      {/* Page Numbers */}
      {getPageNumbers().map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          disabled={loading}
          style={buttonStyle(pageNum === page, loading)}
        >
          {pageNum}
        </button>
      ))}
      
      {/* Next Page */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || loading}
        style={buttonStyle(false, !hasNext || loading)}
      >
        ›
      </button>
      
      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages || loading}
        style={buttonStyle(false, page === totalPages || loading)}
      >
        Last
      </button>
      
      {/* Page Info */}
      <div style={{ 
        marginLeft: '1rem', 
        fontSize: '0.9rem', 
        color: '#6c757d',
        textAlign: 'center',
        minWidth: '120px'
      }}>
        Page {page} of {totalPages}<br />
        <small>({totalItems} total items)</small>
      </div>
    </div>
  );
}

export default Pagination;
