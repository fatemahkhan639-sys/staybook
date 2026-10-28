import { createContext, useContext, useEffect, useState } from 'react';

// Compare is deliberately local: no account needed, and the
// list survives a refresh. Three stays is the cap — more than
// that and the side-by-side table stops being readable.
const COMPARE_KEY = 'staybook_compare';
export const COMPARE_MAX = 3;

const CompareContext = createContext(null);

function readStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  }, [ids]);

  // Returns false when the list is already full, so the button
  // can tell the guest why nothing happened.
  function toggle(id) {
    if (ids.includes(id)) {
      setIds(ids.filter((x) => x !== id));
      return true;
    }
    if (ids.length >= COMPARE_MAX) return false;
    setIds([...ids, id]);
    return true;
  }

  return (
    <CompareContext.Provider value={{ ids, toggle, count: ids.length }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
