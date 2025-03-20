import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Container, Typography, Button, TextField, Box, Card, CardContent, CardActions } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

function SubmissionsView({ user, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/submissions');
      setSubmissions(response.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des soumissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (submissionId, newGrade, newFeedback) => {
    setLoading(true);
    setMessage('');
    try {
      await api.put(`/submissions/${submissionId}`, {
        grade: newGrade,
        feedback: newFeedback,
      });
      setMessage('Soumission mise à jour avec succès !');
      fetchSubmissions();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erreur lors de la mise à jour');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, background: '#f5f5f5', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Gestion des soumissions
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={loading}
          sx={{ mb: 3, borderRadius: 20 }}
        >
          {loading ? 'Chargement...' : 'Retour'}
        </Button>
        {message && (
          <Typography sx={{ mb: 2, color: message.includes('Erreur') ? '#d32f2f' : '#388e3c' }}>
            {message}
          </Typography>
        )}
        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>Toutes les soumissions</Typography>
        {submissions.map(sub => (
          <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * submissions.indexOf(sub) }}>
            <Card sx={{ mb: 2, boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Typography><strong>Étudiant :</strong> {sub.student_email}</Typography>
                <Typography><strong>Exercice :</strong> {sub.exercise_title}</Typography>
                <Typography><strong>Fichier :</strong> {sub.file_path}</Typography>
                <Typography><strong>Note actuelle :</strong> {sub.grade}/20</Typography>
                <Typography><strong>Feedback actuel :</strong> {sub.feedback}</Typography>
                <Typography><strong>Score de plagiat :</strong> {(sub.plagiarism_score * 100).toFixed(2)}%</Typography>
              </CardContent>
              <CardActions>
                <TextField
                  type="number"
                  min="0"
                  max="20"
                  defaultValue={sub.grade}
                  onBlur={(e) => handleUpdate(sub.id, parseInt(e.target.value), sub.feedback)}
                  sx={{ width: '60px', mr: 2 }}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  defaultValue={sub.feedback}
                  onBlur={(e) => handleUpdate(sub.id, sub.grade, e.target.value)}
                  sx={{ flexGrow: 1, mr: 2 }}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleUpdate(sub.id, sub.grade, sub.feedback)}
                  disabled={loading}
                  sx={{ borderRadius: 20 }}
                >
                  Sauvegarder
                </Button>
              </CardActions>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
}

export default SubmissionsView;