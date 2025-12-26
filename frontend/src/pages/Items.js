import React, { useEffect, useState, useCallback } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import PageSizeSelector from "../components/PageSizeSelector";
import Pagination from "../components/Pagination";

function Items() {
  const {
    items,
    pagination,
    searchQuery,
    loading,
    fetchItems,
    searchItems,
    changePage,
    changePageSize,
  } = useData();

  const [error, setError] = useState(null);

  useEffect(() => {
    // Create AbortController for this effect
    const abortController = new AbortController();
    setError(null);

    // Initial fetch with pagination (page 1, 10 items per page)
    fetchItems(
      { page: 1, pageSize: 10, search: "" },
      abortController.signal
    ).catch((error) => {
      if (error.name !== "AbortError" && !abortController.signal.aborted) {
        setError(error.message);
      }
    });

    // Clean‑up to avoid memory leak - abort the fetch request
    return () => {
      abortController.abort();
    };
  }, []); // Empty dependency array for initial load only

  const handleSearch = useCallback(
    async (query) => {
      const abortController = new AbortController();
      setError(null);

      try {
        await searchItems(query, abortController.signal);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      }
    },
    [searchItems]
  );

  const handlePageChange = useCallback(
    async (newPage) => {
      const abortController = new AbortController();
      setError(null);

      try {
        await changePage(newPage, abortController.signal);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      }
    },
    [changePage]
  );

  const handlePageSizeChange = useCallback(
    async (newPageSize) => {
      const abortController = new AbortController();
      setError(null);

      try {
        await changePageSize(newPageSize, abortController.signal);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      }
    },
    [changePageSize]
  );

  if (error) {
    return (
      <div>
        <p>Error loading items: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "auto",
        padding: "1rem",
      }}
    >
      <h2>Items</h2>

      <SearchBar
        onSearch={handleSearch}
        loading={loading}
        initialValue={searchQuery}
      />

      <PageSizeSelector
        pageSize={pagination.pageSize || 10}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
      />

      {loading && <p>Loading...</p>}

      {searchQuery && (
        <p style={{ fontStyle: "italic", color: "#6c757d" }}>
          Showing results for: "{searchQuery}"
        </p>
      )}

      {!loading && items.length === 0 && (
        <p>
          {searchQuery
            ? "No items found for your search."
            : "No items available."}
        </p>
      )}

      {items.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            flex: 1,
            overflowY: "auto",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            backgroundColor: "#ffffff",
            margin: 0,
            marginBottom: "1rem",
          }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                padding: "1rem",
                margin: "0.5rem 0",
                border: "1px solid #e9ecef",
                borderRadius: "4px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Link
                to={"/items/" + item.id}
                style={{
                  textDecoration: "none",
                  color: "#007bff",
                  fontWeight: "bold",
                }}
              >
                {item.name}
              </Link>
              {item.category && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                  }}
                >
                  {item.category}
                </span>
              )}
              {item.price && (
                <span
                  style={{
                    float: "right",
                    fontWeight: "bold",
                    color: "#28a745",
                  }}
                >
                  ${item.price}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}

export default Items;
