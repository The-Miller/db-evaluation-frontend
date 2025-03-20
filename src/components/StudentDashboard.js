import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Container, Typography, Button, Box, Input, Card, CardContent, CardActions, LinearProgress } from '@mui/material';
import { Upload as UploadIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StudentDashboard({ user, onLogout }) {
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      const [exercisesRes, submissionsRes] = await Promise.all([
        api.get('/exercises'),
        api.get('/submissions'),
      ]);
      setExercises(exercisesRes.data);
      setSubmissions(submissionsRes.data.filter(sub => sub.student_id === user.id));
      setAllSubmissions(submissionsRes.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des données');
      console.error(error);
    }
  };

  const handleSubmit = async (exerciseId) => {
    if (!file) {
      setMessage('Veuillez sélectionner un fichier PDF');
      return;
    }
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('student_id', user.id);
    formData.append('exercise_id', exerciseId);
    formData.append('file', file);

    try {
      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Soumission envoyée avec succès !');
      setFile(null);
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erreur lors de la soumission');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: submissions.map(sub => new Date(sub.submitted_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Mes notes',
        data: submissions.map(sub => sub.grade),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#1976d2',
        tension: 0.4,
      },
      {
        label: 'Moyenne de la classe',
        data: submissions.map(() => allSubmissions.length > 0
          ? allSubmissions.reduce((sum, sub) => sum + sub.grade, 0) / allSubmissions.length
          : 0),
        fill: false,
        borderColor: '#ff4081',
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      title: { display: true, text: 'Évolution de mes performances', font: { size: 18 } },
    },
    scales: { y: { beginAtZero: true, max: 20, grid: { color: '#e0e0e0' } } },
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, background: '#f5f5f5', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Bienvenue, {user.email}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{ mb: 3, borderRadius: 20 }}
        >
          Déconnexion
        </Button>
        {message && (
          <Typography sx={{ mb: 2, color: message.includes('Erreur') ? '#d32f2f' : '#388e3c' }}>
            {message}
          </Typography>
        )}

        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>Suivi des performances</Typography>
        {submissions.length > 0 ? (
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Line data={chartData} options={chartOptions} />
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Moyenne personnelle :</strong> {(submissions.reduce((sum, sub) => sum + sub.grade, 0) / submissions.length || 0).toFixed(2)}/20</Typography>
                <Typography><strong>Moyenne de la classe :</strong> {(allSubmissions.length > 0 ? allSubmissions.reduce((sum, sub) => sum + sub.grade, 0) / allSubmissions.length : 0).toFixed(2)}/20</Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Typography>Aucune soumission pour l’instant.</Typography>
        )}

        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>Exercices disponibles</Typography>
        {exercises.map(exercise => (
          <motion.div key={exercise.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * exercises.indexOf(exercise) }}>
            <Card sx={{ mb: 2, boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Typography variant="h6" color="#1976d2">{exercise.title}</Typography>
                <Typography color="textSecondary">{exercise.content}</Typography>
              </CardContent>
              <CardActions>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading}
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => handleSubmit(exercise.id)}
                  disabled={loading}
                  sx={{ borderRadius: 20 }}
                >
                  {loading ? 'Envoi...' : 'Soumettre'}
                </Button>
              </CardActions>
            </Card>
          </motion.div>
        ))}

        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>Vos soumissions</Typography>
        {submissions.map(sub => (
          <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * submissions.indexOf(sub) }}>
            <Card sx={{ mb: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography><strong>Exercice :</strong> {sub.exercise_title}</Typography>
                <Typography><strong>Fichier :</strong> {sub.file_path}</Typography>
                <Typography><strong>Note :</strong> {sub.grade}/20</Typography>
                <Typography><strong>Feedback :</strong> {sub.feedback}</Typography>
                <Typography><strong>Score de plagiat :</strong> {(sub.plagiarism_score * 100).toFixed(2)}%</Typography>
                <Typography><strong>Date :</strong> {new Date(sub.submitted_at).toLocaleString()}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={sub.grade * 5}
                  sx={{ mt: 1, height: 8, borderRadius: 4, backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { backgroundColor: '#1976d2' } }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}

export default StudentDashboard;