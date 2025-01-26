import React from 'react';
import { FileText, Share } from 'lucide-react';

const JobCard = ({ job, onClick }) => {
  const getPostedDays = (createdDate) => {
    const days = Math.floor((new Date() - new Date(createdDate)) / (1000 * 60 * 60 * 24));
    return `Posted ${days} days ago`;
  };

  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-header">
        <div className="job-logo-container">
          {job.company_logo ? (
            <img
              src={`data:image/jpeg;base64,${job.company_logo}`}
              alt={`${job.comp_name} Logo`}
              className="job-logo"
            />
          ) : (
            <span style={{ fontSize: '20px', color: '#666' }}>
              {job.comp_name?.charAt(0) || 'C'}
            </span>
          )}
        </div>
        <div>
          <h3 className="job-title">{job.job_title}</h3>
          <p className="job-posted">{getPostedDays(job.created_date)}</p>
        </div>
      </div>

      <div className="job-id">
        <FileText size={16} />
        <span className="job-id-text">Job ID: {job.job_id}</span>
      </div>

      <div className="job-footer">
        <div className="job-submissions">
          <strong>{job.total_submissions || 0}</strong> submissions
        </div>
        <div className="job-actions">
          <button 
            className="job-action-button"
            onClick={(e) => e.stopPropagation()}
          >
            <Share size={16} />
          </button>
          <button 
            className="job-action-button"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
