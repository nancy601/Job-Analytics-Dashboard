import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

const AssessmentCard = ({ title, icon, children, description, value, isMetric = false }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px', 
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: isMetric ? 'auto' : '100%'
  }}>
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: isMetric ? '8px' : '20px'
    }}>
      {icon && (
        typeof icon === 'string' ? (
          <span>{icon}</span>
        ) : (
          React.cloneElement(icon, {
            style: { width: '20px', height: '20px', color: '#9CA3AF' }
          })
        )
      )}
      <h3 style={{
        margin: 0,
        fontSize: isMetric ? '14px' : '18px',
        fontWeight: isMetric ? '500' : '500',
        color: isMetric ? '#6B7280' : 'inherit'
      }}>{title}</h3>
    </div>
    {isMetric ? (
      <>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>{value}</div>
        {description && <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{description}</p>}
      </>
    ) : (
      <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {children}
      </div>
    )}
  </div>
);

const MetricBox = ({ label, value }) => (
  <div style={{
    backgroundColor: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px'
  }}>
    <div style={{
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    }}>{label}</div>
    <div style={{
      fontSize: '24px',
      fontWeight: 'bold'
    }}>{value}</div>
  </div>
);

const JobAnalytics = ({ jobId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`https://support.peppypick.com/api/jobs/${jobId}/analytics`);
        const data = await response.json();
        setAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    if (jobId) {
      fetchAnalytics();
    }
  }, [jobId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  const renderOverviewTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Application Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'Applied', value: analytics.overview.total_applications },
              { name: 'Started', value: analytics.overview.incomplete_submissions },
              { name: 'Completed', value: analytics.overview.complete_submissions }
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ff6b00" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Application Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={analytics.timeline}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="applications" stroke="#ff6b00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAssessmentTab = () => {
    const resumeAnalysis = analytics.resume_analysis;

    return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    }}>
      {/* Video Assessment */}
      <AssessmentCard 
        title="Video Assessment"
        icon={<span>📹</span>}
      >
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <MetricBox 
            label="Average Score"
            value={`${analytics.video_assessment.average_score}/10`}
          />
          <MetricBox 
            label="Above Ideal"
            value={analytics.video_assessment.above_ideal}
          />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '16px' }}>Emotional Analysis</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={analytics.video_assessment.emotional_analysis}
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="emotion" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [`Count: ${value}`, props.payload.emotion]}
              />
              <Bar 
                dataKey="count" 
                fill="#ff6b00"
                label={{ 
                  position: 'top',
                  fontSize: 12
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AssessmentCard>

      {/* Resume Analysis */}
      <AssessmentCard
        title="Resume Analysis"
        icon={<span>📄</span>}
      >
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <MetricBox 
            label="Keyword Match"
            value={`${resumeAnalysis.keyword_match}%`}
          />
          <MetricBox 
            label="Relevance Score"
            value={`${resumeAnalysis.relevance_score}%`}
          />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '16px' }}>Skills Match Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Match', value: resumeAnalysis.keyword_match },
                  { name: 'Gap', value: 100 - resumeAnalysis.keyword_match }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#ff6b00"
                dataKey="value"
              >
                <Cell key="cell-0" fill="#ff6b00" />
                <Cell key="cell-1" fill="#ffd1b3" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </AssessmentCard>

      {/* MCQ Performance */}
      <AssessmentCard
        title="MCQ Performance"
        icon={<span>📝</span>}
      >
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <MetricBox 
            label="Average Score"
            value={`${analytics.mcq_performance.average_score}/10`}
          />
          <MetricBox 
            label="Above Ideal"
            value={analytics.mcq_performance.above_ideal}
          />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '16px' }}>Performance by Difficulty Level</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.mcq_performance.difficulty_analysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="level"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: 'Success Rate (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 }
                }}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}% (${props.payload.correct}/${props.payload.total})`,
                  'Success Rate'
                ]}
                labelStyle={{ fontSize: 12 }}
              />
              <Bar 
                dataKey="successRate" 
                fill="#ff6b00"
                label={{ 
                  position: 'top',
                  formatter: (value) => `${value}%`,
                  fontSize: 12
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AssessmentCard>

      {/* Case Study Analysis */}
      <AssessmentCard
        title="Case Study Analysis"
        icon={<span>📊</span>}
      >
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <MetricBox 
            label="Average Score"
            value={`${analytics.case_study.average_score}/10`}
          />
          <MetricBox 
            label="Completion Rate"
            value={`${analytics.case_study.completion_rate}%`}
          />
        </div>
        
        <div style={{
          backgroundColor: '#f0f7ff',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h4 style={{ 
            marginTop: 0,
            marginBottom: '12px',
            color: '#1e40af'
          }}>Key Insights</h4>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#3b82f6'
          }}>
            {analytics.case_study.key_insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      </AssessmentCard>
    </div>
  )};

  const renderTechnicalTab = () => {
  const { technical_insights } = analytics;

  if (!technical_insights || !technical_insights.tab_switching) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>No technical data available</h3>
      </div>
    );
  }


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Technical Compliance */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Technical Compliance</h3>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Tab Switching Behavior</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { 
                    name: 'Compliant (No Tab Switches)', 
                    value: technical_insights.tab_switching.compliant 
                  },
                  { 
                    name: 'Non-compliant (Tab Switches Detected)', 
                    value: technical_insights.tab_switching.non_compliant 
                  }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                <Cell key="cell-0" fill="#22C55E" />
                <Cell key="cell-1" fill="#EF4444" />
              </Pie>
              <Tooltip formatter={(value, name) => [`Count: ${value}`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div style={{ 
            backgroundColor: '#FFFBEB', 
            padding: '16px', 
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <h4 style={{ 
              color: '#92400E',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>Assessment Integrity Insights</h4>
            <ul style={{ 
              color: '#92400E',
              fontSize: '14px',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '8px' }}>
                Average tab switches per candidate: {technical_insights.tab_switching.average.toFixed(1)}
              </li>
              <li style={{ marginBottom: '8px' }}>
                Maximum tab switches detected: {technical_insights.tab_switching.max}
              </li>
              <li>
                {Math.round((technical_insights.tab_switching.non_compliant / 
                  (technical_insights.tab_switching.compliant + technical_insights.tab_switching.non_compliant)) * 100)}% of candidates showed potential integrity concerns
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Device & Browser Analytics */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Device & Browser Analytics</h3>
        
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Device Distribution</h4>
          {/* <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Desktop', value: 75 },
                  { name: 'Mobile', value: 25 }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                <Cell key="cell-0" fill="#3B82F6" />
                <Cell key="cell-1" fill="#60A5FA" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer> */}
        </div>
        <div style={{ 
          backgroundColor: '#EFF6FF', 
          padding: '16px', 
          borderRadius: '8px'
        }}>
          <h4 style={{ 
            color: '#1E40AF',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>Technical Success Rate</h4>
          <ul style={{ 
            color: '#1E40AF',
            fontSize: '14px',
            margin: 0,
            paddingLeft: '20px'
          }}>
          </ul>
          <li style={{ marginBottom: '8px' }}>
              Screen Recording: {Math.round((technical_insights.screen_recording_success / technical_insights.total_responses) * 100)}% successful
          </li>
          <li style={{ marginBottom: '8px' }}>
              Video Upload: {Math.round((technical_insights.video_upload_success / technical_insights.total_responses) * 100)}% successful
          </li>
        </div>
        
      </div>
    </div>
  );
};

  const renderGeographyTab = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Geographic Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analytics.geography}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="home_address" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="candidate_count" fill="#ff6b00" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div style={{ 
      height: '100%',
      backgroundColor: '#F3F4F6',
      overflow: 'auto' 
    }}>
      <div style={{ 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Job Analytics</h2>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Showing analytics for Job ID: {jobId}
          </p>
        </div>

        {/* Metrics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <AssessmentCard
            title="Total Applications"
            value={analytics.overview.total_applications}
            description="Total number of candidates"
            icon={<Users />}
            isMetric={true}
          />
          <AssessmentCard
            title="Complete Submissions"
            value={analytics.overview.complete_submissions}
            description="Fully completed applications"
            icon={<CheckCircle />}
            isMetric={true}
          />
          <AssessmentCard
            title="Incomplete Submissions"
            value={analytics.overview.incomplete_submissions}
            description="Partially completed applications"
            icon={<AlertTriangle />}
            isMetric={true}
          />
          <AssessmentCard
            title="Not Started"
            value={analytics.overview.not_started}
            description="Registered but not started"
            icon={<Clock />}
            isMetric={true}
          />
        </div>

        {/* Tabs Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px',
          backgroundColor: '#F3F4F6',
          position: 'sticky',
          top: '0px', 
          zIndex: 10
        }}>
          {['Overview', 'Assessment Performance', 'Technical Insights', 'Demographics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: activeTab === tab.toLowerCase().replace(' ', '-') ? '#2563eb' : '#6b7280',
                borderBottom: activeTab === tab.toLowerCase().replace(' ', '-') ? '2px solid #2563eb' : 'none',
                fontWeight: '500'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'assessment-performance' && renderAssessmentTab()}
          {activeTab === 'technical-insights' && renderTechnicalTab()}
          {activeTab === 'demographics' && renderGeographyTab()}
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;

