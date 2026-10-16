
import React, { useState } from 'react';
import api from '../../Service/api';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    CircularProgress,
    Typography,
    IconButton,
    Paper,
    Divider,
    MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AddCourseModal({ open, onClose, onCourseAdded, courseToEdit }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fullDescription: '',
        instructor: '',
        duration: '',
        level: '',
        prerequisites: '',
        learningOutcomes: ''
    });

    const [modules, setModules] = useState([
        {
            title: 'Module 1',
            lessons: [
                { title: 'Lesson 1', type: 'Video', mediaId: '', uploadStatus: 'idle' }
            ]
        }
    ]);

    // Effect to populate data for Edit Mode
    React.useEffect(() => {
        if (open) {
            if (courseToEdit) {
                // Populate form data
                setFormData({
                    title: courseToEdit.title || '',
                    description: courseToEdit.description || '',
                    fullDescription: courseToEdit.fullDescription || '',
                    instructor: courseToEdit.instructor || '',
                    duration: courseToEdit.duration || '',
                    level: courseToEdit.level || '',
                    prerequisites: courseToEdit.prerequisites ? courseToEdit.prerequisites.join(', ') : '',
                    learningOutcomes: courseToEdit.learningOutcomes ? courseToEdit.learningOutcomes.join(', ') : ''
                });

                // Populate modules if they exist
                if (courseToEdit.modules && courseToEdit.modules.length > 0) {
                    const mappedModules = courseToEdit.modules.map(m => ({
                        title: m.title,
                        lessons: m.lessons.map(l => ({
                            title: l.title,
                            type: l.type || 'Video',
                            mediaId: l.mediaId || '',
                            uploadStatus: l.mediaId ? 'success' : 'idle'
                        }))
                    }));
                    setModules(mappedModules);
                } else {
                    // Default if no modules
                    setModules([{ title: 'Module 1', lessons: [{ title: 'Lesson 1', type: 'Video', mediaId: '', uploadStatus: 'idle' }] }]);
                }
            } else {
                // Reset for Add Mode
                setFormData({
                    title: '',
                    description: '',
                    fullDescription: '',
                    instructor: '',
                    duration: '',
                    level: '',
                    prerequisites: '',
                    learningOutcomes: ''
                });
                setModules([{ title: 'Module 1', lessons: [{ title: 'Lesson 1', type: 'Video', mediaId: '', uploadStatus: 'idle' }] }]);
                setStep(1);
            }
        }
    }, [open, courseToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Curriculum Handlers ---

    const addModule = () => {
        setModules([...modules, { title: `Module ${modules.length + 1}`, lessons: [] }]);
    };

    const removeModule = (mIndex) => {
        const newModules = [...modules];
        newModules.splice(mIndex, 1);
        setModules(newModules);
    };

    const updateModuleTitle = (mIndex, title) => {
        const newModules = [...modules];
        newModules[mIndex].title = title;
        setModules(newModules);
    };

    const addLesson = (mIndex) => {
        const newModules = [...modules];
        newModules[mIndex].lessons.push({ title: '', type: 'Video', mediaId: '', uploadStatus: 'idle' });
        setModules(newModules);
    };

    const removeLesson = (mIndex, lIndex) => {
        const newModules = [...modules];
        newModules[mIndex].lessons.splice(lIndex, 1);
        setModules(newModules);
    };

    const updateLesson = (mIndex, lIndex, field, value) => {
        const newModules = [...modules];
        newModules[mIndex].lessons[lIndex][field] = value;
        setModules(newModules);
    };

    // --- Media Upload ---

    // --- Media Upload ---

    // ... (rest of imports)

    // --- Media Upload ---

    const handleFileUpload = async (mIndex, lIndex, file) => {
        if (!file) return;

        // Update status to uploading
        const newModules = [...modules];
        newModules[mIndex].lessons[lIndex].uploadStatus = 'uploading';
        setModules(newModules);

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const userRole = localStorage.getItem('role');
            // Use api.post for automatic auth and gateway routing
            const response = await api.post('/api/media/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-User-Role': userRole || 'ADMIN'
                }
            });

            // Success (Axios resolves on 2xx)
            const data = response.data;

            const successModules = [...modules];
            successModules[mIndex].lessons[lIndex].mediaId = data.mediaId;
            successModules[mIndex].lessons[lIndex].uploadStatus = 'success';
            setModules(successModules);
            console.log(`Uploaded media for M${mIndex}-L${lIndex}:`, data.mediaId);

        } catch (error) {
            console.error("Upload error:", error);
            const failModules = [...modules];
            failModules[mIndex].lessons[lIndex].uploadStatus = 'error';
            setModules(failModules);
            const serverMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(`Failed to upload file: ${serverMsg}`);
        }
    };


    const handleSubmit = () => {
        setLoading(true);

        const payload = {
            ...formData,
            prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(s => s.trim()) : [],
            learningOutcomes: formData.learningOutcomes ? formData.learningOutcomes.split(',').map(s => s.trim()) : [],
            modules: modules.map(m => ({
                title: m.title,
                lessons: m.lessons.map(l => ({
                    title: l.title,
                    type: l.type,
                    mediaId: l.mediaId
                }))
            }))
        };

        console.log("Submitting Course Payload:", payload);

        const url = courseToEdit
            ? `/api/courses/${courseToEdit.id || courseToEdit.courseId}` // Use ID if available
            : '/api/courses';

        const apiCall = courseToEdit
            ? api.put(url, payload)
            : api.post(url, payload);

        apiCall
            .then(res => {
                setLoading(false);
                console.log(`Course ${courseToEdit ? 'Updated' : 'Created'}:`, res.data);
                onCourseAdded();
                onClose();
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                alert(`Failed to ${courseToEdit ? 'update' : 'create'} course. ` + (err.response?.data?.message || err.message));
            });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{courseToEdit ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogContent dividers>
                {step === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" color="primary">Basis Information</Typography>
                        <TextField autoFocus name="title" label="Course Title" fullWidth value={formData.title} onChange={handleChange} required />
                        <TextField name="instructor" label="Instructor Name" fullWidth value={formData.instructor} onChange={handleChange} required />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField name="duration" label="Duration" fullWidth value={formData.duration} onChange={handleChange} />
                            <TextField name="level" label="Level" fullWidth value={formData.level} onChange={handleChange} />
                        </Box>
                        <TextField name="description" label="Short Description" multiline rows={2} fullWidth value={formData.description} onChange={handleChange} />
                        <TextField name="fullDescription" label="Full Description" multiline rows={4} fullWidth value={formData.fullDescription} onChange={handleChange} />
                        <TextField name="prerequisites" label="Prerequisites (Comma separated)" fullWidth value={formData.prerequisites} onChange={handleChange} />
                        <TextField name="learningOutcomes" label="Learning Outcomes (Comma separated)" fullWidth value={formData.learningOutcomes} onChange={handleChange} />
                    </Box>
                )}

                {step === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="h6" color="primary">Curriculum & Media</Typography>
                        {modules.map((module, mIndex) => (
                            <Paper key={mIndex} variant="outlined" sx={{ p: 2, bgcolor: '#f9fafb' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <TextField
                                        label={`Module ${mIndex + 1} Title`}
                                        value={module.title}
                                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                                        size="small"
                                        fullWidth
                                        variant="standard"
                                        InputProps={{ style: { fontWeight: 600 } }}
                                    />
                                    <IconButton onClick={() => removeModule(mIndex)} color="error"><DeleteIcon /></IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 2, borderLeft: '3px solid #e5e7eb' }}>
                                    {module.lessons.map((lesson, lIndex) => (
                                        <Box key={lIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'white', p: 1, borderRadius: 1, border: '1px solid #eee' }}>
                                            <TextField
                                                placeholder="Lesson Title"
                                                value={lesson.title}
                                                onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                select
                                                value={lesson.type}
                                                onChange={(e) => updateLesson(mIndex, lIndex, 'type', e.target.value)}
                                                size="small"
                                                sx={{ width: 100 }}
                                            >
                                                <MenuItem value="Video">Video</MenuItem>
                                                <MenuItem value="PDF">PDF</MenuItem>
                                            </TextField>

                                            {/* Media Upload Button */}
                                            <Button
                                                component="label"
                                                variant={lesson.uploadStatus === 'success' ? "outlined" : "contained"}
                                                color={lesson.uploadStatus === 'success' ? "success" : "primary"}
                                                startIcon={lesson.uploadStatus === 'success' ? <CheckCircleIcon /> : <CloudUploadIcon />}
                                                size="small"
                                                disabled={lesson.uploadStatus === 'uploading'}
                                            >
                                                {lesson.uploadStatus === 'uploading' ? 'Uploading...' : (lesson.uploadStatus === 'success' ? 'Uploaded' : 'Upload')}
                                                <input type="file" hidden onChange={(e) => handleFileUpload(mIndex, lIndex, e.target.files[0])} />
                                            </Button>

                                            <IconButton onClick={() => removeLesson(mIndex, lIndex)} size="small" color="default"><DeleteIcon fontSize="small" /></IconButton>
                                        </Box>
                                    ))}
                                    <Button startIcon={<AddCircleOutlineIcon />} onClick={() => addLesson(mIndex)} size="small" sx={{ alignSelf: 'start', mt: 1 }}>Add Lesson</Button>
                                </Box>
                            </Paper>
                        ))}
                        <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addModule}>Add New Module</Button>
                    </Box>
                )}

            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                {step === 2 && <Button onClick={() => setStep(1)}>Back</Button>}
                <Button onClick={onClose} color="inherit">Cancel</Button>
                {step === 1 ? (
                    <Button variant="contained" onClick={() => setStep(2)}>Next: Curriculum</Button>
                ) : (
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : (courseToEdit ? "Update Course" : "Create Course")}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
