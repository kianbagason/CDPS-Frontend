import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './StudentSearch.css';

const StudentSearch = ({ onSelect, placeholder = 'Search by student number or name...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/students', { params: { q: query, limit: 10 } });
        setResults(res.data.data || []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
        setOpen(true);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (student) => {
    setQuery(`${student.studentNumber} - ${student.lastName}, ${student.firstName}`);
    setOpen(false);
    if (onSelect) onSelect(student);
  };

  return (
    <div className="student-search" ref={containerRef} style={{ position: 'relative' }}>
      <input
        className="clay-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); }}
        onFocus={() => { if (results.length) setOpen(true); }}
      />

      {open && (
        <div className="student-search-dropdown" style={{ position: 'absolute', zIndex: 50, width: '100%', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: '280px', overflowY: 'auto', borderRadius: '6px' }}>
          {loading && <div style={{ padding: '8px' }}>Searching...</div>}
          {!loading && results.length === 0 && <div style={{ padding: '8px' }}>No matches</div>}
          {!loading && results.map(s => (
            <div key={s._id} className="student-search-item" style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => handleSelect(s)}>
              <div style={{ fontWeight: 600 }}>{s.studentNumber} — {s.lastName}, {s.firstName}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{s.course || ''} • {s.section || ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
