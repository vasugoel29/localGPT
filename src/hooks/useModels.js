import { useState, useEffect, useRef } from 'react';
import { fetchModels } from '../services/api';

export function useModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const load = async () => {
    const requestId = ++requestIdRef.current;
    if (requestId === requestIdRef.current) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const list = await fetchModels();
      if (requestId === requestIdRef.current) {
        setModels(list);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => { load(); }, []);

  return { models, loading, error, refresh: load };
}
