import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import JobCard from './job-card';
import JobAnalytics from './JobAnalytics';
import '../styles/jobs.css';

const JobList = ({ companyId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`https://support.peppypick.com/api/jobs?company_id=${companyId}`);
        const data = await response.json();
        setJobs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    if (companyId) {
      fetchJobs();
    }
  }, [companyId]);

  const handlePrevClick = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextClick = () => {
    setCurrentIndex(prev => Math.min(jobs.length - itemsPerView, prev + 1));
  };

  if (loading) {
    return (
      <div className="jobs-container">
        <div className="jobs-header">
          <div style={{ width: '200px', height: '24px', background: '#eee', borderRadius: '4px' }}></div>
          <div style={{ width: '100px', height: '24px', background: '#eee', borderRadius: '20px' }}></div>
        </div>
        <div className="jobs-slider-container">
          <div className="jobs-slider">
            <div className="jobs-track" style={{ gap: '20px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ 
                  flex: '0 0 280px',
                  height: '200px', 
                  background: '#eee', 
                  borderRadius: '8px' 
                }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1 className="jobs-title">Open Job Roles</h1>
        <div className="jobs-count">
          {jobs.length} Jobs Created
        </div>
      </div>

      <div className="jobs-slider-container">
        <button 
          className="slider-button prev"
          onClick={handlePrevClick}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="jobs-slider">
          <div 
            className="jobs-track"
            style={{
              transform: `translateX(-${currentIndex * (280 + 20)}px)`
            }}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onClick={() => setSelectedJob(job)}
              />
            ))}
          </div>
        </div>

        <button 
          className="slider-button next"
          onClick={handleNextClick}
          disabled={currentIndex >= jobs.length - itemsPerView}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="slider-dots">
        {Array.from({ length: Math.ceil(jobs.length / itemsPerView) }).map((_, index) => (
          <div
            key={index}
            className={`slider-dot ${Math.floor(currentIndex / itemsPerView) === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index * itemsPerView)}
          />
        ))}
      </div>

      {selectedJob && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '800px',
            height: '90vh', 
            display: 'flex',  
            flexDirection: 'column', 
            overflow: 'hidden' 
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'white',
              zIndex: 1,
              flexShrink: 0 
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'calc(100% - 40px)' 
              }}>
                Analytics for {selectedJob.job_title}
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ 
              flex: 1,
              overflow: 'hidden' 
            }}>
              <JobAnalytics jobId={selectedJob.job_id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;

// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import JobCard from './job-card';
// import JobAnalytics from './JobAnalytics';
// import '../styles/jobs.css';

// const JobList = ({ companyId }) => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const itemsPerView = 4;

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/jobs?company_id=${companyId}`);
//         const data = await response.json();
//         setJobs(data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching jobs:', error);
//         setLoading(false);
//       }
//     };

//     if (companyId) {
//       fetchJobs();
//     }
//   }, [companyId]);

//   const handlePrevClick = () => {
//     setCurrentIndex(prev => Math.max(0, prev - 1));
//   };

//   const handleNextClick = () => {
//     setCurrentIndex(prev => Math.min(jobs.length - itemsPerView, prev + 1));
//   };

//   const handleJobClick = (job) => {
//     setSelectedJob(selectedJob?.job_id === job.job_id ? null : job);
//   };

//   if (loading) {
//     return (
//       <div className="jobs-container">
//         <div className="jobs-header">
//           <div style={{ width: '200px', height: '24px', background: '#eee', borderRadius: '4px' }}></div>
//           <div style={{ width: '100px', height: '24px', background: '#eee', borderRadius: '20px' }}></div>
//         </div>
//         <div className="jobs-slider-container">
//           <div className="jobs-slider">
//             <div className="jobs-track" style={{ gap: '20px' }}>
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} style={{ 
//                   flex: '0 0 280px',
//                   height: '200px', 
//                   background: '#eee', 
//                   borderRadius: '8px' 
//                 }}></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="jobs-container">
//       <div className="jobs-header">
//         <h1 className="jobs-title">Open Job Roles</h1>
//         <div className="jobs-count">
//           {jobs.length} Jobs Created
//         </div>
//       </div>

//       <div className="jobs-content">
//         <div className="jobs-slider-container">
//           <button 
//             className="slider-button prev"
//             onClick={handlePrevClick}
//             disabled={currentIndex === 0}
//           >
//             <ChevronLeft size={20} />
//           </button>

//           <div className="jobs-slider">
//             <div 
//               className="jobs-track"
//               style={{
//                 transform: `translateX(-${currentIndex * (280 + 20)}px)`
//               }}
//             >
//               {jobs.map((job) => (
//                 <JobCard
//                   key={job.job_id}
//                   job={job}
//                   onClick={() => handleJobClick(job)}
//                   isSelected={selectedJob?.job_id === job.job_id}
//                 />
//               ))}
//             </div>
//           </div>

//           <button 
//             className="slider-button next"
//             onClick={handleNextClick}
//             disabled={currentIndex >= jobs.length - itemsPerView}
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>

//         <div className="slider-dots">
//           {Array.from({ length: Math.ceil(jobs.length / itemsPerView) }).map((_, index) => (
//             <div
//               key={index}
//               className={`slider-dot ${Math.floor(currentIndex / itemsPerView) === index ? 'active' : ''}`}
//               onClick={() => setCurrentIndex(index * itemsPerView)}
//             />
//           ))}
//         </div>

//         {selectedJob && (
//           <div className="job-analytics-container" style={{
//             marginTop: '2rem',
//             padding: '1rem',
//             backgroundColor: '#fff',
//             borderRadius: '8px',
//             boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//           }}>
//             <JobAnalytics jobId={selectedJob.job_id} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobList;

