import React, { useEffect, useState } from "react";
import API from "../services/api";
import FeatureTable from "../components/tables/FeatureTable";

export default function FeatureTablePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50); // rows per page
  const [hasMore, setHasMore] = useState(true);

  // Fetch paginated data
  const fetchData = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/features?page=${pageNumber}&page_size=${pageSize}`);
      const fetchedData = res.data.data || [];
      setData(fetchedData);
      setHasMore(fetchedData.length === pageSize); // if less than pageSize, no more pages
    } catch (err) {
      console.error(err);
      setData([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Feature Table</h2>

      <FeatureTable data={data} loading={loading} />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          disabled={!hasMore}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
