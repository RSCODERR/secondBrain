import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export function useContent() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        withCredentials: true
      });

      setContents(res.data.contents);
    } catch (err) {
      setError("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    contents,
    loading,
    error,
    refetch: fetchContent 
  };
}
