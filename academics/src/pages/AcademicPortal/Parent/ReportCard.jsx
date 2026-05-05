import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiDataLayer } from '../../../services/apiDataLayer';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../Student/ReportCard.css';

const ReportCard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [reportCards, setReportCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6c757d'];

  // Fetch children linked to parent
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        // Get all users and filter for children linked to this parent
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const linkedChildren = allUsers.filter(u => u.parentEmail === user.email && u.role === 'student');
        setChildren(linkedChildren);

        if (linkedChildren.length > 0) {
          setSelectedChild(linkedChildren[0]);
        }
      } catch (err) {
        console.warn('Failed to load children:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchChildren();
    }
  }, [user?.email]);

  // Fetch report cards for selected child
  useEffect(() => {
    const fetchReportCards = async () => {
      if (!selectedChild?.user_id) return;

      try {
        const response = await apiDataLayer.get(`/api/report-cards?studentId=${selectedChild.user_id}`);
        setReportCards(response.data || []);

        if (response.data && response.data.length > 0) {
          const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setSelectedCard(sorted[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load report cards');
      }
    };

    fetchReportCards();
  }, [selectedChild?.user_id]);

  // Fetch AI analysis when report card is selected
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCard?.id) return;

      try {
        const response = await apiDataLayer.get(`/api/ai-analysis/${selectedCard.id}`);
        setAnalysis(response.data);
      } catch (err) {
        console.warn('Failed to load analysis:', err.message);
        setAnalysis(null);
      }
    };

    fetchAnalysis();
  }, [selectedCard?.id]);

  const handleTermChange = (term, year) => {
    const card = reportCards.find(c => c.term === term && c.year === year);
    setSelectedCard(card || null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('PDF download feature coming soon');
  };

  if (loading) {
    return <div className="report-card loading">Loading report cards...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="report-card">
        <div className="no-data">
          <p>No children linked to your account.</p>
        </div>
      </div>
    );
  }

  if (!selectedCard) {
    return (
      <div className="report-card">
        <div className="no-data">
          <p>No report cards available for {selectedChild?.name}.</p>
        </div>
      </div>
    );
  }

  const chartData = selectedCard.subjects?.map(s => ({
    name: s.name,
    marks: s.marksObtained,
    percentage: s.percentage
  })) || [];

  const gradeDistribution = selectedCard.subjects?.reduce((acc, s) => {
    const grade = s.grade;
    const existing = acc.find(item => item.name === grade);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: grade, value: 1 });
    }
    return acc;
  }, []) || [];

  return (
    <div className="report-card">
      <div className="header">
        <h1>My Child's Report Card</h1>
        <div className="actions">
          <button className="btn-print" onClick={handlePrint}>🖨️ Print</button>
          <button className="btn-download" onClick={handleDownloadPDF}>📥 Download PDF</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Child Selector */}
      <div className="term-selector">
        <h3>Select Child</h3>
        <div className="term-buttons">
          {children.map(child => (
            <button
              key={child.user_id}
              className={`term-btn ${selectedChild?.user_id === child.user_id ? 'active' : ''}`}
              onClick={() => setSelectedChild(child)}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {/* Term Selector */}
      <div className="term-selector">
        <h3>Select Term</h3>
        <div className="term-buttons">
          {reportCards.map(card => (
            <button
              key={`${card.term}-${card.year}`}
              className={`term-btn ${selectedCard?.id === card.id ? 'active' : ''}`}
              onClick={() => handleTermChange(card.term, card.year)}
            >
              {card.term} {card.year}
            </button>
          ))}
        </div>
      </div>

      {/* Report Card Header */}
      <div className="card-header">
        <div className="header-info">
          <h2>Academic Performance Report</h2>
          <p><strong>Student:</strong> {selectedChild?.name}</p>
          <p><strong>Term:</strong> {selectedCard.term} {selectedCard.year}</p>
          <p><strong>Date:</strong> {new Date(selectedCard.created_at).toLocaleDateString()}</p>
        </div>
        <div className="overall-performance">
          <div className="performance-box">
            <div className="percentage">{selectedCard.overall_percentage}%</div>
            <div className="grade">{selectedCard.overall_grade}</div>
            <div className="label">Overall Performance</div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="subjects-section">
        <h3>Subject-wise Performance</h3>
        <table className="subjects-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks</th>
              <th>Max Marks</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {selectedCard.subjects?.map((subject, index) => (
              <tr key={index}>
                <td>{subject.name}</td>
                <td>{subject.marksObtained}</td>
                <td>{subject.maxMarks}</td>
                <td>
                  <span className={`percentage-badge ${subject.grade.toLowerCase()}`}>
                    {subject.percentage}%
                  </span>
                </td>
                <td>
                  <span className={`grade-badge ${subject.grade.toLowerCase()}`}>
                    {subject.grade}
                  </span>
                </td>
                <td>{subject.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teacher Remarks */}
      {selectedCard.teacher_remarks && (
        <div className="teacher-remarks">
          <h3>Teacher's Remarks</h3>
          <p>{selectedCard.teacher_remarks}</p>
        </div>
      )}

      {/* Visualizations */}
      <div className="visualizations">
        <div className="chart-container">
          <h3>Marks Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="marks" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Analysis Section */}
      {analysis && (
        <div className="ai-analysis-section">
          <h2>📊 AI Performance Analysis</h2>

          {/* Strengths and Weaknesses */}
          <div className="strengths-weaknesses">
            <div className="strengths">
              <h3>💪 Strengths</h3>
              {analysis.performance?.strengths?.map((strength, index) => (
                <div key={index} className="strength-item">
                  <div className="subject-name">{strength.subject}</div>
                  <div className="percentage">{strength.percentage}%</div>
                  <div className="feedback">{strength.feedback}</div>
                </div>
              ))}
            </div>

            <div className="weaknesses">
              <h3>📈 Areas for Improvement</h3>
              {analysis.performance?.weaknesses?.map((weakness, index) => (
                <div key={index} className="weakness-item">
                  <div className="subject-name">{weakness.subject}</div>
                  <div className="percentage">{weakness.percentage}%</div>
                  <div className="feedback">{weakness.feedback}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          {analysis.performance?.summary && (
            <div className="performance-summary">
              <h3>Performance Summary</h3>
              <p>{analysis.performance.summary}</p>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="recommendations">
              <h3>🎯 Personalized Recommendations</h3>
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="priority">Priority {rec.priority}</div>
                  <div className="subject">{rec.subject}</div>
                  <div className="recommendation">{rec.recommendation}</div>
                  {rec.resources && (
                    <div className="resources">
                      <strong>Resources:</strong> {rec.resources.join(', ')}
                    </div>
                  )}
                  {rec.timeAllocation && (
                    <div className="time-allocation">
                      <strong>Time Allocation:</strong> {rec.timeAllocation}
                    </div>
                  )}
                  {rec.shortTermGoal && (
                    <div className="goals">
                      <strong>Short-term Goal:</strong> {rec.shortTermGoal}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Written Analysis */}
          {analysis.written_analysis && (
            <div className="written-analysis">
              <h3>📝 Detailed Analysis</h3>
              <p>{analysis.written_analysis}</p>
            </div>
          )}

          {/* Trends */}
          {analysis.trends && (
            <div className="trends">
              <h3>📊 Performance Trends</h3>
              <div className="trend-info">
                <p><strong>Overall Trend:</strong> <span className={`trend-${analysis.trends.overallTrend}`}>{analysis.trends.overallTrend}</span></p>
                {analysis.trends.improvingSubjects?.length > 0 && (
                  <p><strong>Improving:</strong> {analysis.trends.improvingSubjects.join(', ')}</p>
                )}
                {analysis.trends.decliningSubjects?.length > 0 && (
                  <p><strong>Declining:</strong> {analysis.trends.decliningSubjects.join(', ')}</p>
                )}
                {analysis.trends.consistentStrengths?.length > 0 && (
                  <p><strong>Consistent Strengths:</strong> {analysis.trends.consistentStrengths.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .header .actions,
          .term-selector {
            display: none;
          }
          .report-card {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export { ReportCard };
