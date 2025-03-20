import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Container, Typography, Button, Box, Card, CardContent, CardActionArea } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsDashboard({ user, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/submissions');
      setSubmissions(response.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const studentStats = submissions.reduce((acc, sub) => {
    if (!acc[sub.student_email]) {
      acc[sub.student_email] = { grades: [], exercises: [], plagiarismScores: [] };
    }
    acc[sub.student_email].grades.push(sub.grade);
    acc[sub.student_email].exercises.push(sub.exercise_title);
    acc[sub.student_email].plagiarismScores.push(sub.plagiarism_score);
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(studentStats),
    datasets: [
      {
        label: 'Note moyenne',
        data: Object.values(studentStats).map(stats => 
          stats.grades.reduce((sum, grade) => sum + grade, 0) / stats.grades.length || 0
        ),
        backgroundColor: 'rgba(25, 118, 210, 0.8)',
        borderColor: '#1976d2',
        borderWidth: 1,
        borderRadius: 10,
        barThickness: 20,
      },
      {
        label: 'Score de plagiat moyen (%)',
        data: Object.values(studentStats).map(stats => 
          (stats.plagiarismScores.reduce((sum, score) => sum + score, 0) / stats.plagiarismScores.length * 100) || 0
        ),
        backgroundColor: 'rgba(255, 64, 129, 0.8)', // Accent rose
        borderColor: '#ff4081',
        borderWidth: 1,
        borderRadius: 10,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14, family: 'Roboto' }, color: '#424242' } },
      title: { 
        display: true, 
        text: 'Performances et plagiat par étudiant', 
        font: { size: 20, weight: 'bold', family: 'Roboto' }, 
        color: '#1976d2',
        padding: 20,
      },
      tooltip: {
        backgroundColor: '#424242',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, // Pour inclure plagiat en %
        grid: { color: '#e0e0e0' }, 
        ticks: { color: '#424242' },
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#424242', font: { size: 12 } },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeOutBounce',
    },
  };

  const handleStudentClick = (email) => {
    setSelectedStudent(selectedStudent === email ? null : email);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
          Tableau de bord analytique
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={loading}
          sx={{ mb: 3, borderRadius: 20, display: 'block', mx: 'auto' }}
        >
          {loading ? 'Chargement...' : 'Retour'}
        </Button>
        {message && (
          <Typography sx={{ mb: 2, color: message.includes('Erreur') ? '#d32f2f' : '#388e3c', textAlign: 'center' }}>
            {message}
          </Typography>
        )}

        <Typography variant="h5" sx={{ mb: 3, color: '#424242', textAlign: 'center' }}>
          Statistiques des performances
        </Typography>
        {submissions.length > 0 ? (
          <Card sx={{ mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ height: 400 }}>
              <Bar data={chartData} options={chartOptions} />
            </CardContent>
          </Card>
        ) : (
          <Typography textAlign="center">Aucune soumission pour l’instant.</Typography>
        )}

        <Typography variant="h5" sx={{ mb: 3, color: '#424242', textAlign: 'center' }}>
          Détails par étudiant
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {Object.entries(studentStats).map(([email, stats]) => (
            <motion.div
              key={email}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * Object.keys(studentStats).indexOf(email) }}
            >
              <Card
                sx={{
                  width: 300,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  bgcolor: selectedStudent === email ? '#e3f2fd' : 'white',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
                }}
              >
                <CardActionArea onClick={() => handleStudentClick(email)}>
                  <CardContent>
                    <Typography variant="h6" color="#1976d2"><strong>{email}</strong></Typography>
                    <Typography><strong>Note moyenne :</strong> {(stats.grades.reduce((sum, g) => sum + g, 0) / stats.grades.length).toFixed(2)}/20</Typography>
                    <Typography><strong>Plagiat moyen :</strong> {(stats.plagiarismScores.reduce((sum, s) => sum + s, 0) / stats.plagiarismScores.length * 100).toFixed(2)}%</Typography>
                    {selectedStudent === email && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} transition={{ duration: 0.3 }}>
                        <Typography sx={{ mt: 1, color: '#616161' }}>
                          <strong>Exercices soumis :</strong> {stats.exercises.join(', ')}
                        </Typography>
                      </motion.div>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Container>
  );
}

export default AnalyticsDashboard;