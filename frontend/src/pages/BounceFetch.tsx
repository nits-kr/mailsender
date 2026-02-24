import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BounceFetch = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [server, setServer] = useState('');
    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            // Mocking server list for now
            setServers(['Bounce (172.104.161.85)', 'Server 2', 'Server 3']);
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    };

    const handleFetch = async () => {
        if (!date || !server) {
            setStatusMsg('Choose date and server!');
            return;
        }

        setLoading(true);
        setResponse('Processing... Request sent to remote server.');

        try {
            const res = await axios.post('/api/data/fetch-bounce', { server, date });
            setResponse(res.data.message || 'Bounce data retrieved.');
            setStatusMsg('Done');
        } catch (error: any) {
            setResponse(`Error: ${error.response?.data?.message || error.message}`);
            setStatusMsg('Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4" style={{ fontFamily: '"Lucida Console", Monaco, monospace' }}>
            <div className="max-w-[1000px] mx-auto">
                <h2 className="text-center text-xl font-bold mb-8 pt-4 uppercase tracking-tighter">BOUNCE FETCH PORTAL</h2>

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
                            <option value="">Choose Server</option>
                            {servers.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <button 
                            onClick={handleFetch}
                            disabled={loading}
                            className={`bg-[#5cb85c] border border-[#4cae4c] text-white px-8 py-1 font-bold shadow-sm hover:bg-[#449d44] transition-colors uppercase text-[11px]`}
                        >
                            {loading ? 'Fetching...' : 'GET BOUNCE'}
                        </button>
                    </div>
                </div>

                <div className="mt-8 px-4">
                    <div className="w-full bg-[#5F9EA0] border border-gray-400 p-2 h-[400px] overflow-y-auto font-mono text-[11px] leading-tight">
                        <p className="text-green-900 font-bold mb-1">Bounce Process Status...</p>
                        {statusMsg && (
                            <p className={statusMsg === 'Failed' ? 'text-red-900' : 'text-green-900'}>
                                [{statusMsg.toUpperCase()}] {statusMsg === 'Done' ? 'Bounce data retrieval completed.' : ''}
                            </p>
                        )}
                        <pre className="whitespace-pre-wrap text-[#003300] font-bold">
                            {response || 'Waiting for request...'}
                        </pre>
                        {loading && (
                            <div className="text-white mt-2">
                                <p>Connecting to {server}...</p>
                                <p>Fetching bounces for date {date}...</p>
                                <p className="animate-pulse">Retrieving records from MySQL remote server...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BounceFetch;
