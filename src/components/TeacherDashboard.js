import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Container, Typography, Button, TextField, Box, Card, CardContent, CardActions } from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

function TeacherDashboard({ user, onLogout, onViewSubmissions, onViewAnalytics }) {
  const [exercises, setExercises] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [correction, setCorrection] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchExercises();
  }, [user.id]);

  const fetchExercises = async () => {
    try {
      const response = await api.get('/exercises');
      setExercises(response.data.filter(ex => ex.teacher_id === user.id));
    } catch (error) {
      setMessage('Erreur lors du chargement des exercices');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exercises', {
        teacher_id: user.id,
        title,
        content,
        correction,
      });
      setMessage('Exercice créé avec succès !');
      setTitle('');
      setContent('');
      setCorrection('');
      fetchExercises();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erreur lors de la création');
      console.error(error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, background: '#f5f5f5', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Bienvenue, {user.email}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ mr: 2, borderRadius: 20 }}
          >
            Déconnexion
          </Button>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={onViewSubmissions}
            sx={{ mr: 2, borderRadius: 20, color: '#1976d2', borderColor: '#1976d2' }}
          >
            Soumissions
          </Button>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={onViewAnalytics}
            sx={{ borderRadius: 20, color: '#1976d2', borderColor: '#1976d2' }}
          >
            Analytics
          </Button>
        </Box>
        {message && (
          <Typography sx={{ mb: 2, color: message.includes('Erreur') ? '#d32f2f' : '#388e3c' }}>
            {message}
          </Typography>
        )}

        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>Créer un nouvel exercice</Typography>
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Titre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <TextField
                label="Contenu de l’exercice"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                rows={4}
                required
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <TextField
                label="Correction (facultatif)"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth sx={{ borderRadius: 20 }}>
                Créer
              </Button>
            </form>
          </CardContent>
        </Card>

        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>Vos exercices</Typography>
        {exercises.map(exercise => (
          <motion.div key={exercise.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * exercises.indexOf(exercise) }}>
            <Card sx={{ mb: 2, boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Typography variant="h6" color="#1976d2">{exercise.title}</Typography>
                <Typography color="textSecondary">{exercise.content}</Typography>
                <Typography><strong>Correction :</strong> {exercise.correction || 'Non définie'}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}

export default TeacherDashboard;