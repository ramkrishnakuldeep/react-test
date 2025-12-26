import React, { useState } from 'react';

function SearchBar({ onSearch, loading, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        style={{ 
          padding: '0.5rem', 
          marginRight: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          minWidth: '200px'
        }}
      />
      <button 
        type="submit" 
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: '1px solid #007bff',
          backgroundColor: '#007bff',
          color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      {query && (
        <button 
          type="button"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            marginLeft: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #6c757d',
            backgroundColor: '#6c757d',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Clear
        </button>
      )}
    </form>
  );
}

export default SearchBar;
