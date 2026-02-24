import React, { useState } from 'react';
import axios from 'axios';

const DataUpload = () => {
    const [displayName, setDisplayName] = useState('');
    const [filename, setFilename] = useState('');
    const [mode, setMode] = useState('Desktop');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleUpload = async () => {
        if (!displayName || !filename) {
            setStatus({ type: 'error', message: 'Display name and filename are required!' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Uploading to database...' });

        try {
            await axios.post('/api/data/upload', {
                displayName,
                filename,
                mode
            });
            setStatus({ type: 'success', message: 'Data inserted into DB successfully!' });
            setDisplayName('');
            setFilename('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4" style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}>
            <div className="max-w-[1000px] mx-auto">
                <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter">Data Insert Portal</h2>

                <div className="flex flex-col items-center gap-4 text-[12px] font-bold">
                    <div className="flex items-center gap-2">
                        <label>File Name To Display = </label>
                        <input 
                            type="text" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="border border-gray-400 px-2 py-0.5 w-64 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={mode === 'Desktop'} onChange={() => setMode('Desktop')} /> Desktop
                        </label>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <label>File Upload = </label>
                        <input 
                            type="file" 
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFilename(e.target.files[0].name);
                                }
                            }}
                            className="text-[11px]"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <label>Upload Progrss -{'>'} </label>
                        <div className="w-64 h-2 bg-gray-200 border border-gray-400 rounded-sm">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button 
                            onClick={handleUpload}
                            disabled={loading}
                            className="bg-gray-100 border border-gray-500 px-8 py-1 font-bold shadow-sm hover:bg-gray-200 transition-colors"
                        >
                            {loading ? 'Processing...' : 'Insert Into DB'}
                        </button>
                    </div>
                </div>

                <div className="mt-8 px-4">
                    <div className="w-full bg-[#5F9EA0] border border-gray-400 p-2 h-[400px] overflow-y-auto font-mono text-[11px] leading-tight">
                        <p className="text-green-900 font-bold mb-1">Upload Progress Status...</p>
                        {status.message && (
                            <p className={status.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                [{status.type.toUpperCase()}] {status.message}
                            </p>
                        )}
                        {loading && (
                            <div className="text-white">
                                <p>Processing file: {filename}...</p>
                                <p>Target DB Display: {displayName}...</p>
                                <p>--- DATABASE INSERTION IN PROGRESS ---</p>
                                <p className="animate-pulse">Reading chunks...</p>
                            </div>
                        )}
                        {status.type === 'success' && (
                            <div className="text-green-900 font-bold">
                                <p>DONE! {displayName} inserted into emailmaster database.</p>
                                <p>Total records processed: [COUNT]</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataUpload;
