import React, { useState } from 'react';
import api from '../../Service/api';

const MediaUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Get token from localStorage (assuming it's stored as 'token')
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found. Please login.");
            }

            const role = localStorage.getItem('role') || 'ADMIN';
            // Using the Gateway URL (Relative path for proxy/consistency)
            const response = await api.post('/api/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-User-Role': role
                }
            });

            // Axios throws on 4xx/5xx, so we can assume success if we reach here
            setResult(response.data);
        } catch (err) {
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Upload failed";
            setError(errMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
        }}>
            <h3 style={{ color: '#1f2937', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Upload Media to IPFS
            </h3>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />

                <button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: uploading ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        marginTop: '0.5rem'
                    }}
                >
                    {uploading ? 'Uploading to IPFS...' : 'Upload File'}
                </button>
            </div>

            {error && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '6px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '6px'
                }}>
                    <h4 style={{ color: '#166534', marginBottom: '0.5rem' }}>Upload Successful!</h4>
                    <p><strong>Media ID:</strong> <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '4px' }}>{result.mediaId}</code></p>
                    <p><strong>CID:</strong> <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '4px' }}>{result.contentIdentifier}</code></p>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        Use this Media ID when creating a lesson.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MediaUpload;
