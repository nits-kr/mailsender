import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Link as LinkIcon, ExternalLink, Loader2, Search, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllOffers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/offers');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => 
    offer.offer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.offer_id.toString().includes(searchTerm) ||
    offer.affiliate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f0f8ff', minHeight: '100vh', padding: '20px', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
      <center>
        <div style={{ 
          backgroundColor: '#337ab7', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '4px 4px 0 0', 
          maxWidth: '1200px',
          border: '1px solid #2e6da4'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', fontFamily: 'Lucida Console, Courier, monospace' }}>
            ALL OFFER PORTAL
          </h2>
        </div>
      </center>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        backgroundColor: 'white', 
        border: '1px solid #337ab7', 
        padding: '15px', 
        borderRadius: '0 0 4px 4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search offers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', width: '250px' }}
            />
          </div>
          <button 
            onClick={() => navigate('/offers')}
            style={{ 
              backgroundColor: '#5cb85c', 
              color: 'white', 
              border: '1px solid #4cae4c', 
              padding: '5px 15px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Plus size={14} /> ADD OFFER
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: 'cadetblue', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>O.M.ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>AFFILIATE</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>OFFER ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>OFFER NAME</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>PAYOUT</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>SENSITIVE</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>ACTION</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>CREATE LINK</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : filteredOffers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No offers found.</td>
              </tr>
            ) : (
              filteredOffers.map((offer, index) => (
                <tr key={offer._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{offer._id.slice(-6).toUpperCase()}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{offer.affiliate}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{offer.offer_id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{offer.offer_name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>${offer.payout}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{offer.sensitive === '1' ? 'Yes' : 'No'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <button 
                      onClick={() => navigate(`/offers?id=${offer._id}`)}
                      style={{ padding: '3px 8px', backgroundColor: '#f0ad4e', border: '1px solid #eea236', color: 'white', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Edit
                    </button>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <button 
                      style={{ padding: '3px 8px', backgroundColor: '#5cb85c', border: '1px solid #4cae4c', color: 'white', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Create Link
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllOffers;
