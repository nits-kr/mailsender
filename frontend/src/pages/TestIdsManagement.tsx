import React, { useState } from 'react';
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import { 
  useGetTestIdsQuery, 
  useAddTestIdMutation, 
  useUpdateTestIdMutation, 
  useDeleteTestIdMutation 
} from '../store/apiSlice';

const TestIdsManagement = () => {
  const { data: testIds = [], isLoading, error: fetchError } = useGetTestIdsQuery();
  const [addTestId] = useAddTestIdMutation();
  const [updateTestId] = useUpdateTestIdMutation();
  const [deleteTestId] = useDeleteTestIdMutation();

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    domain: '',
    email: '',
    password: '',
    inboxhostname: '',
    spamhostname: '',
    port: '',
    status: 'A',
    _id: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await updateTestId({ id: formData._id, ...formData }).unwrap();
      } else {
        await addTestId(formData).unwrap();
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Error saving Test ID');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Test ID?')) {
      try {
        await deleteTestId(id).unwrap();
      } catch (error) {
        alert('Error deleting Test ID');
      }
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      domain: item.domain,
      email: item.email,
      password: item.password,
      inboxhostname: item.inboxhostname,
      spamhostname: item.spamhostname,
      port: item.port,
      status: item.status,
      _id: item._id
    });
    setShowModal(true);
  };
  
  const handleView = (item: any) => {
    setSelectedId(item);
    setViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      domain: '',
      email: '',
      password: '',
      inboxhostname: '',
      spamhostname: '',
      port: '',
      status: 'A',
      _id: ''
    });
  };

  const filteredIds = testIds.filter(item => 
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-white min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto shadow-[3px_4px_23px_-4px_rgba(0,0,0,0.48)] p-5 rounded-sm">
        <h1 className="text-2xl font-medium text-center mb-8 text-[#333]">Test Ids Managment portal</h1>
        
        <div className="flex justify-end mb-6 gap-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                />
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
            </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#f0ad4e] hover:bg-[#ec971f] text-white px-4 py-1.5 rounded-[4px] text-sm font-normal w-[80px] transition-colors"
          >
            Add
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-1/2 mx-auto border-collapse border border-gray-300 mb-0">
            <thead>
              <tr className="bg-[#60D6FF]">
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[10%]">sno</th>
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[25%]">Email</th>
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[25%]">Domain</th>
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[10%]">Status</th>
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[7%]">Edit</th>
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[7%]">View</th>
                <th className="p-2 border-b-2 border-[#dee2e6] text-center font-bold text-[#333] w-[7%]">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredIds.map((item, idx) => (
                <tr key={item._id} className={idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}>
                  <td className="p-2 border-t border-[#ddd] text-base align-top">{idx + 1}</td>
                  <td className="p-2 border-t border-[#ddd] text-base align-top">{item.email}</td>
                  <td className="p-2 border-t border-[#ddd] text-base align-top">{item.domain}</td>
                  <td className="p-2 border-t border-[#ddd] text-base align-top font-bold">
                    {item.status === 'A' ? (
                      <span className="text-[green]">ACTIVE</span>
                    ) : (
                      <span className="text-[red]">Deactive</span>
                    )}
                  </td>
                  <td className="p-2 border-t border-[#ddd] text-base align-top text-center">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="bg-[#5cb85c] hover:bg-[#449d44] text-white px-2 py-1 rounded-[3px] text-xs w-[55%]"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="p-2 border-t border-[#ddd] text-base align-top text-center">
                    <button 
                      onClick={() => handleView(item)}
                      className="bg-[#5bc0de] hover:bg-[#31b0d5] text-white px-2 py-1 rounded-[3px] text-xs w-[55%]"
                    >
                      view
                    </button>
                  </td>
                  <td className="p-2 border-t border-[#ddd] text-base align-top text-center">
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-2 py-1 rounded-[3px] text-xs w-[55%]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-8 z-50">
          <div className="bg-white rounded-[6px] shadow-lg w-[600px] relative flex flex-col pointer-events-auto bg-clip-padding outline-0">
            <div className="flex items-start justify-between p-[15px] border-b border-[#e5e5e5] rounded-t-[4px]">
              <h4 className="m-0 text-[18px] font-medium leading-[1.42857143]">Test Ids Portal</h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[21px] font-bold leading-[1] text-[#000] opacity-20 hover:opacity-100 bg-transparent border-0 p-0 cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="relative p-[15px]">
              <form onSubmit={handleSubmit}>
                <div className="mb-[15px]">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Enter Domain</label>
                   <input 
                     type="text" 
                     name="domain"
                     value={formData.domain}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] shadow-inset transition-colors focus:border-[#66afe9] focus:outline-0 focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)]"
                   />
                </div>
                
                <div className="mb-[15px]">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Enter Email Id</label>
                   <input 
                     type="text" 
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] focus:border-[#66afe9] focus:outline-0"
                   />
                </div>

                <div className="mb-[15px]">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Select Password</label>
                   <input 
                     type="text" 
                     name="password"
                     value={formData.password}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] focus:border-[#66afe9] focus:outline-0"
                   />
                </div>

                <div className="mb-[15px]">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Enter Hostname For Inbox</label>
                   <input 
                     type="text" 
                     name="inboxhostname"
                     value={formData.inboxhostname}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] focus:border-[#66afe9] focus:outline-0"
                   />
                </div>

                <div className="mb-[15px]">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Enter Hostname For Spam</label>
                   <input 
                     type="text" 
                     name="spamhostname"
                     value={formData.spamhostname}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] focus:border-[#66afe9] focus:outline-0"
                   />
                </div>

                <div className="mb-[15px]">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Enter Port</label>
                   <input 
                     type="text" 
                     name="port"
                     value={formData.port}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] focus:border-[#66afe9] focus:outline-0"
                   />
                </div>

                <div className="mb-[15px] space-y-4">
                   <label className="inline-block max-w-full mb-[5px] font-bold text-[#333]">Enter Status</label>
                   <select 
                     name="status"
                     value={formData.status}
                     onChange={handleInputChange}
                     className="block w-full h-[34px] px-[12px] py-[6px] text-[14px] leading-[1.42857143] text-[#555] bg-white border border-[#ccc] rounded-[4px] focus:border-[#66afe9] focus:outline-0"
                   >
                     <option value="A">Active</option>
                     <option value="D">Deactive</option>
                   </select>
                </div>
                
                <div className="mt-8">
                    <button 
                        type="submit" 
                        className="bg-[#5cb85c] hover:bg-[#449d44] text-white px-[12px] py-[6px] rounded-[4px] text-[14px] w-[26%] border border-[#4cae4c]"
                    >
                        {formData._id ? 'Update' : 'Insert'}
                    </button>
                </div>

              </form>
            </div>
            
            <div className="p-[15px] border-t border-[#e5e5e5] rounded-b-[4px] text-right">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-white hover:bg-[#e6e6e6] text-[#333] px-[12px] py-[6px] rounded-[4px] text-[14px] border border-[#ccc] w-[26%]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal && selectedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-8 z-50">
             <div className="bg-white rounded-[6px] shadow-lg w-[600px] relative flex flex-col pointer-events-auto bg-clip-padding outline-0">
                <div className="flex items-start justify-between p-[15px] border-b border-[#e5e5e5] rounded-t-[4px]">
                <h4 className="m-0 text-[18px] font-medium leading-[1.42857143]">Test Ids Details</h4>
                <button 
                    onClick={() => setViewModal(false)}
                    className="text-[21px] font-bold leading-[1] text-[#000] opacity-20 hover:opacity-100 bg-transparent border-0 p-0 cursor-pointer"
                >
                    ×
                </button>
                </div>
                <div className="modal-body p-[15px]" id="employee_detail">  
                    <div className="table-responsive">  
                        <table className="table table-bordered w-full text-left border-collapse border border-[#ddd]">
                            <tbody>
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Domain</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">{selectedId.domain}</td>  
                                </tr>  
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Email Id</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">{selectedId.email}</td>  
                                </tr>  
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Password</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">{selectedId.password}</td>  
                                </tr>  
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Inbox Hostname</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">{selectedId.inboxhostname}</td>  
                                </tr>  
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Spam Hostname</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">{selectedId.spamhostname}</td>  
                                </tr>  
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Port</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">{selectedId.port}</td>  
                                </tr>
                                <tr>  
                                    <td width="30%" className="p-2 border border-[#ddd] font-bold"><label>Status</label></td>  
                                    <td width="70%" className="p-2 border border-[#ddd]">
                                        {selectedId.status === 'A' ? 'Active' : 'Deactive'}
                                    </td>  
                                </tr>
                            </tbody>
                        </table>  
                    </div>  
                </div>  
                <div className="modal-footer p-[15px] border-t border-[#e5e5e5] text-right">  
                    <button type="button" className="bg-white hover:bg-[#e6e6e6] text-[#333] px-[12px] py-[6px] rounded-[4px] text-[14px] border border-[#ccc]" onClick={() => setViewModal(false)}>Close</button>  
                </div>  
            </div>  
        </div>  
      )}

    </div>
  );
};

export default TestIdsManagement;
