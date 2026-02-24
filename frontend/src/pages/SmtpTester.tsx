import React, { useState } from 'react';
import { useTestSmtpMutation } from '../store/apiSlice';

const SmtpTester = () => {
  const [formData, setFormData] = useState({
    server: '',
    port: '587',
    usr: '',
    pass: '',
    tls: 'No',
    ip: '', // From Email Address
    from: '', // From Name
    sub: '',
    emails: '', // Test Email addresses
    message: ''
  });

  const [testSmtp, { isLoading, data, error }] = useTestSmtpMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await testSmtp(formData).unwrap();
    } catch (err) {
      console.error('Failed to send SMTP test:', err);
    }
  };

  return (
    <div className="p-4 bg-white min-h-screen font-serif">
      <div className="max-w-[1200px] mx-auto border-2 border-dotted border-black p-1">
        <form onSubmit={handleSubmit}>
          <table className="w-full border-2 border-black border-collapse">
            <tbody>
              {/* Header section */}
              <tr className="bg-[#000033] text-white">
                <td className="p-4 border-r border-black w-1/3">
                  <h2 className="text-2xl font-bold italic">SMTP TESTER</h2>
                </td>
                <td className="p-4 text-center border-black">
                  <div className="text-black inline-block bg-white p-2 border border-dotted border-gray-400">
                    <span className="text-xs font-bold block mb-1">--- From Email Address</span>
                    <input
                      type="text"
                      name="ip"
                      value={formData.ip}
                      onChange={handleInputChange}
                      className="border border-dotted border-gray-400 font-medium px-2 py-1 w-[300px] outline-none"
                    />
                  </div>
                </td>
              </tr>

              {/* Main Section */}
              <tr>
                {/* Left Column: Credentials */}
                <td className="align-top p-4 border-r border-black border-collapse" style={{ fontSize: '13.5px' }}>
                  <p className="border-b border-dotted border-gray-600 mb-4 pb-1">SMTP Credentials</p>
                  <div className="space-y-4 font-bold">
                    <div>
                      Server: <input name="server" type="text" value={formData.server} onChange={handleInputChange} className="border border-gray-300 ml-1 px-1 font-normal w-[180px]" />
                    </div>
                    <div>
                      Port: <input name="port" type="text" value={formData.port} onChange={handleInputChange} className="border border-gray-300 ml-1 px-1 font-normal w-[180px]" />
                    </div>
                    <div>
                      User: <input name="usr" type="text" value={formData.usr} onChange={handleInputChange} className="border border-gray-300 ml-1 px-1 font-normal w-[180px]" />
                    </div>
                    <div>
                      Pass: <input name="pass" type="password" value={formData.pass} onChange={handleInputChange} className="border border-gray-300 ml-1 px-1 font-normal w-[180px]" />
                    </div>
                    <div>
                      TLS: 
                      <select name="tls" value={formData.tls} onChange={handleInputChange} className="border border-gray-300 ml-1 px-1 font-normal w-[100px]">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </td>

                {/* Right Column: Message Content */}
                <td className="p-4 align-top">
                  <div className="max-w-[600px] mx-auto space-y-4">
                    <div className="flex items-center">
                      <strong className="w-24 text-xs">Subject</strong>
                      <input
                        type="text"
                        name="sub"
                        value={formData.sub}
                        onChange={handleInputChange}
                        className="flex-1 border border-gray-300 px-2 py-1 outline-none text-xs"
                      />
                    </div>
                    <div className="flex items-center">
                      <strong className="w-24 text-xs">From</strong>
                      <input
                        type="text"
                        name="from"
                        value={formData.from}
                        onChange={handleInputChange}
                        className="flex-1 border border-gray-300 px-2 py-1 outline-none text-xs"
                        placeholder="From Name"
                      />
                    </div>
                    <div className="flex items-start">
                      <strong className="w-24 text-xs pt-1">Test Email</strong>
                      <textarea
                        name="emails"
                        value={formData.emails}
                        onChange={handleInputChange}
                        className="flex-1 border border-gray-300 px-2 py-1 h-24 outline-none text-xs"
                        placeholder="Recipients (one per line)"
                      />
                    </div>

                    <div className="flex items-start">
                      <strong className="w-24 text-xs pt-1">Body</strong>
                      <div className="flex-1">
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-2 py-1 h-[300px] outline-none text-xs"
                          placeholder="put text here"
                        />
                      </div>
                    </div>

                    {isLoading && (
                      <div className="bg-[#0479C0] text-white text-center py-1 text-sm font-bold animate-pulse">
                        Sending ..
                      </div>
                    )}

                    <div className="border border-black flex">
                      <div className="w-[150px] border-r border-black text-center py-1 text-xs">
                        -- HEADERS --
                      </div>
                      <div className="flex-1 text-center py-1 bg-gray-50">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="hover:text-blue-600 transition-colors uppercase font-medium text-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Debug Logs Section */}
              {(data || error) && (
                <tr>
                  <td></td>
                  <td className="p-4">
                    <div className="bg-gray-100 p-2 border border-black max-h-[400px] overflow-auto mb-4">
                      {data && (
                        <div>
                          <p className="text-green-700 font-bold mb-2">{data.message}</p>
                          <pre className="text-[10px] whitespace-pre-wrap font-mono">
                            {data.logs}
                          </pre>
                        </div>
                      )}
                      {error && (
                        <div className="text-red-700 font-bold">
                          Error: {(error as any).data?.message || 'Failed to send'}
                          <pre className="text-[10px] mt-2 whitespace-pre-wrap font-mono text-black font-normal">
                             {(error as any).data?.logs}
                          </pre>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default SmtpTester;
