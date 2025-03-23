import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user } = useAuth();
  const [groups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const { token } = useAuth();
  const [togglestate,setToggleState]=useState(false)


  useEffect(() => {
    console.log(user)
    fetchUserGroups();
  }, [togglestate]);


  const openGroup = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}/ismember`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      response&&navigate(`/group/${groupId}`);
      
    } catch (err) {
      console.error('Failed to fetch group details');
    }
      navigate(`/group/${groupId}`);
  }

  const deleteGroup = async (groupId) => {
    console.log(groupId)
    try {
      await axios.post(`http://localhost:5000/api/groups/${groupId}/delete`, {}, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setToggleState((prev)=>!prev)
    } catch (err) {
      console.error('Failed to fetch group details');
    }
  }

  const automaticDelete = async ()=>{
    try {
      await axios.post(`http://localhost:5000/api/groups/delete`, {}, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to fetch group details');
    }
  }

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/group`, {
        headers: { Authorization: `Bearer ${Token}` }
      });
      console.log(response.data)
      setUserGroups(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user groups:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      {/* <div className="profile-header">
        <h2>Profile</h2>
        <div className="user-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div> */}

<div className="grid md:grid-cols-2 gap-6">
        {groups.groups.map(group => (
          <div key={group._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.destination}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(group.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
              <button
                onClick={() => openGroup(group._id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-500/50 transition"
              >
                Open Group
              </button>
              {(group.creator===group.userId)&&(<button
                onClick={() => deleteGroup(group._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-green-500/50 transition"
              >
                Delete
              </button>)}
              
              <button
                onClick={() => leaveGroup(group._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-green-500/50 transition"
              >
                Leave
              </button>
            
              </div>
            
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;