import React from 'react';
import JobList from './components/JobList';
import './styles/jobs.css';

function App() {
  const companyId = 2224; 

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px 0' }}>
      <JobList companyId={companyId} />
    </div>
  );
}

export default App;

