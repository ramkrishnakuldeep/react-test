import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Use useRef to store current values to avoid dependency issues
  const currentStateRef = useRef({ pagination, searchQuery });

  // Update ref when state changes
  useEffect(() => {
    currentStateRef.current = { pagination, searchQuery };
  }, [pagination, searchQuery]);

  const fetchItems = useCallback(async (options = {}, abortSignal = null) => {
    const { page = 1, pageSize = 10, search = "" } = options;

    console.log("DataContext: fetchItems called with options:", options);

    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      // New pagination mode
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());
      if (search) {
        params.append("q", search);
      }

      const url = `http://localhost:3001/api/items?${params.toString()}`;
      console.log("DataContext: fetching from URL:", url);
      const res = await fetch(url, {
        signal: abortSignal,
      });

      if (abortSignal && abortSignal.aborted) {
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (abortSignal && abortSignal.aborted) {
        return;
      }

      console.log("Frontend: Raw API response:", json);

      // New paginated response format
      console.log("Frontend: Backend returned paginated response");
      setItems(json.items || []);
      setPagination(
        json.pagination || {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      );
      setSearchQuery(json.search || "");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      throw error;
    } finally {
      if (!abortSignal || !abortSignal.aborted) {
        setLoading(false);
      }
    }
  }, []); // No dependencies to prevent infinite loop

  const searchItems = useCallback(
    async (query, abortSignal = null) => {
      const currentState = currentStateRef.current;
      return fetchItems(
        {
          page: 1,
          pageSize: currentState.pagination.pageSize,
          search: query,
        },
        abortSignal
      );
    },
    [fetchItems]
  );

  const changePage = useCallback(
    async (newPage, abortSignal = null) => {
      const currentState = currentStateRef.current;
      return fetchItems(
        {
          page: newPage,
          pageSize: currentState.pagination.pageSize,
          search: currentState.searchQuery,
        },
        abortSignal
      );
    },
    [fetchItems]
  );

  const changePageSize = useCallback(
    async (newPageSize, abortSignal = null) => {
      console.log("DataContext: changePageSize called with:", newPageSize);
      const currentState = currentStateRef.current;
      console.log("DataContext: current state:", currentState);
      return fetchItems(
        {
          page: 1,
          pageSize: newPageSize,
          search: currentState.searchQuery,
        },
        abortSignal
      );
    },
    [fetchItems]
  );

  return (
    <DataContext.Provider
      value={{
        items,
        pagination,
        searchQuery,
        loading,
        fetchItems,
        searchItems,
        changePage,
        changePageSize,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
