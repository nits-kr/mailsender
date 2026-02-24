import React, { useState } from 'react';
import axios from 'axios';

const BounceUpdate = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [server, setServer] = useState('Bounce (172.104.161.85)');
    const [ids, setIds] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleUpdate = async () => {
        if (!ids.trim()) {
            setStatus({ type: 'error', message: 'Email IDs are required!' });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Updating records...' });

        try {
            const idArray = ids.split('\n').map(l => l.trim()).filter(l => l);
            await axios.post('/api/data/status-update', { ids: idArray, type: 'bounce', server, date });
            setStatus({ type: 'success', message: 'Done' });
            setIds('');
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4" style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}>
            <div className="max-w-[1000px] mx-auto">
                <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter">BOUNCE UPDATE PORTAL</h2>

                <div className="flex flex-col items-center gap-4 text-[12px] font-bold">
                    <div className="flex items-center gap-2">
                        <label>Date (yyyy-mm-dd) = </label>
                        <input 
                            type="text" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-gray-400 px-2 py-0.5 w-64 outline-none font-mono"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label>Target Server = </label>
                        <select 
                            value={server}
                            onChange={(e) => setServer(e.target.value)}
                            className="border border-gray-400 px-2 py-0.5 w-64 outline-none font-mono bg-white"
                        >
                            <option value="Bounce (172.104.161.85)">Bounce (172.104.161.85)</option>
                            <option value="Server 2">Server 2</option>
                        </select>
                    </div>

                    <div className="flex flex-col items-center gap-2 w-full max-w-[600px]">
                        <label>Ids (One Per Line) = </label>
                        <textarea 
                            value={ids}
                            onChange={(e) => setIds(e.target.value)}
                            className="w-full h-32 border border-gray-400 px-2 py-1 outline-none text-gray-700 font-mono text-[11px] resize-none"
                        />
                    </div>

                    <div className="mt-4">
                        <button 
                            onClick={handleUpdate}
                            disabled={loading}
                            className={`bg-[#5cb85c] border border-[#4cae4c] text-white px-8 py-1 font-bold shadow-sm hover:bg-[#449d44] transition-colors uppercase text-[11px]`}
                        >
                            {loading ? 'Updating...' : 'UPDATE BOUNCE'}
                        </button>
                    </div>
                </div>

                <div className="mt-8 px-4">
                    <div className="w-full bg-[#5F9EA0] border border-gray-400 p-2 h-[400px] overflow-y-auto font-mono text-[11px] leading-tight">
                        <p className="text-green-900 font-bold mb-1">Bounce Process Status...</p>
                        {status.message && (
                            <p className={status.type === 'error' ? 'text-red-900' : 'text-green-900'}>
                                [{status.type.toUpperCase()}] {status.message === 'Done' ? 'Records updated in bounce database.' : status.message}
                            </p>
                        )}
                        {loading && (
                            <div className="text-white mt-2">
                                <p>Processing IDs on {server}...</p>
                                <p className="animate-pulse">Writing to suppression tables...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BounceUpdate;
