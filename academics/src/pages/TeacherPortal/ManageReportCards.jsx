import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiDataLayer from '../../services/apiDataLayer';
import './ManageReportCards.css';

const ManageReportCards = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [reportCards, setReportCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    subjects: [{ name: '', marksObtained: '', maxMarks: 100, remarks: '' }],
    teacherRemarks: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const GRADING_SCALE = {
    'A': { min: 90, max: 100 },
    'B': { min: 80, max: 89 },
    'C': { min: 70, max: 79 },
    'D': { min: 60, max: 69 },
    'F': { min: 0, max: 59 }
  };

  // Fetch students and report cards
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch students from the class
        const studentsData = await apiDataLayer.get('/school/students');
        setStudents(studentsData.data?.items || studentsData.data || []);

        // Fetch report cards
        const cardsData = await apiDataLayer.get('/report-cards');
        const cardsByStudent = {};
        const cardsList = cardsData.data?.items || cardsData.data || [];
        
        // Ensure cardsList is an array before calling forEach
        if (Array.isArray(cardsList)) {
          cardsList.forEach(card => {
            if (!cardsByStudent[card.student_id]) {
              cardsByStudent[card.student_id] = [];
            }
            cardsByStudent[card.student_id].push(card);
          });
        }
        setReportCards(cardsByStudent);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentage = (marks, maxMarks) => {
    if (maxMarks <= 0) return 0;
    return Math.round((marks / maxMarks) * 100 * 100) / 100;
  };

  const assignGrade = (percentage) => {
    for (const [grade, range] of Object.entries(GRADING_SCALE)) {
      if (percentage >= range.min && percentage <= range.max) {
        return grade;
      }
    }
    return 'F';
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: '', marksObtained: '', maxMarks: 100, remarks: '' }]
    });
  };

  const removeSubject = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage('');

      // Validate subjects
      if (formData.subjects.length === 0) {
        setError('At least one subject is required');
        return;
      }

      for (const subject of formData.subjects) {
        if (!subject.name.trim()) {
          setError('All subject names are required');
          return;
        }
        if (subject.marksObtained === '' || subject.marksObtained === null) {
          setError('All marks are required');
          return;
        }
        if (subject.marksObtained > subject.maxMarks) {
          setError(`Marks cannot exceed max marks for ${subject.name}`);
          return;
        }
        if (subject.marksObtained < 0) {
          setError('Marks cannot be negative');
          return;
        }
      }

      const payload = {
        studentId: selectedStudent.user_id,
        classId: selectedStudent.class_id,
        term,
        year: parseInt(year),
        subjects: formData.subjects.map(s => ({
          name: s.name,
          marksObtained: parseFloat(s.marksObtained),
          maxMarks: parseFloat(s.maxMarks),
          remarks: s.remarks
        })),
        teacherRemarks: formData.teacherRemarks
      };

      const response = await apiDataLayer.post('/report-cards', payload);

      setSuccessMessage(`Report card created successfully for ${selectedStudent.name}`);
      setSelectedStudent(null);
      setFormData({
        subjects: [{ name: '', marksObtained: '', maxMarks: 100, remarks: '' }],
        teacherRemarks: ''
      });

      // Refresh report cards
      const cardsData = await apiDataLayer.get('/report-cards');
      const cardsByStudent = {};
      const cardsList = cardsData.data?.items || cardsData.data || [];
      
      // Ensure cardsList is an array before calling forEach
      if (Array.isArray(cardsList)) {
        cardsList.forEach(card => {
          if (!cardsByStudent[card.student_id]) {
            cardsByStudent[card.student_id] = [];
          }
          cardsByStudent[card.student_id].push(card);
        });
      }
      setReportCards(cardsByStudent);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create report card');
    }
  };

  const getReportCardStatus = (studentId) => {
    const cards = reportCards[studentId] || [];
    const currentCard = cards.find(c => c.term === term && c.year === parseInt(year));
    return currentCard?.status || 'Not Started';
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number?.includes(searchTerm) ||
    student.roll_number?.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="manage-report-cards loading">Loading...</div>;
  }

  // Student Selection View
  if (!selectedStudent) {
    return (
      <div className="manage-report-cards">
        <div className="header">
          <h1>Manage Report Cards</h1>
          <div className="filters">
            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option>Term 1</option>
              <option>Term 2</option>
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="student-selection">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, admission number, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="students-grid">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div
                  key={student.user_id}
                  className="student-card"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-info">
                    <h3>{student.name}</h3>
                    <p className="admission">Admission: {student.admission_number}</p>
                    <p className="roll">Roll No: {student.roll_number}</p>
                  </div>
                  <div className="status-badge">
                    <span className={`status ${getReportCardStatus(student.user_id).toLowerCase().replace(/\s+/g, '-')}`}>
                      {getReportCardStatus(student.user_id)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-students">
                {searchTerm ? 'No students found matching your search' : 'No students available'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Report Card Form View
  return (
    <div className="manage-report-cards">
      <div className="form-container">
        <div className="form-header">
          <h2>Report Card for {selectedStudent?.name}</h2>
          <button className="btn-close" onClick={() => setSelectedStudent(null)}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Subjects</h3>
            <div className="grading-scale">
              <p><strong>Grading Scale:</strong> 90-100: A | 80-89: B | 70-79: C | 60-69: D | 0-59: F</p>
            </div>

            {formData.subjects.map((subject, index) => (
              <div key={index} className="subject-row">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Marks"
                  value={subject.marksObtained}
                  onChange={(e) => handleSubjectChange(index, 'marksObtained', e.target.value)}
                  min="0"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Marks"
                  value={subject.maxMarks}
                  onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                  min="1"
                  required
                />
                <div className="calculated-fields">
                  <span className="percentage">
                    {subject.marksObtained && subject.maxMarks
                      ? `${calculatePercentage(subject.marksObtained, subject.maxMarks)}%`
                      : '-'}
                  </span>
                  <span className="grade">
                    {subject.marksObtained && subject.maxMarks
                      ? assignGrade(calculatePercentage(subject.marksObtained, subject.maxMarks))
                      : '-'}
                  </span>
                </div>
                <textarea
                  placeholder="Remarks"
                  value={subject.remarks}
                  onChange={(e) => handleSubjectChange(index, 'remarks', e.target.value)}
                  maxLength="500"
                />
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeSubject(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="btn-add-subject" onClick={addSubject}>
              + Add Subject
            </button>
          </div>

          <div className="form-section">
            <label>Teacher Remarks</label>
            <textarea
              value={formData.teacherRemarks}
              onChange={(e) => setFormData({ ...formData, teacherRemarks: e.target.value })}
              placeholder="Overall remarks about the student's performance"
              maxLength="1000"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Save Report Card</button>
            <button type="button" className="btn-cancel" onClick={() => setSelectedStudent(null)}>Back to Students</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageReportCards;
