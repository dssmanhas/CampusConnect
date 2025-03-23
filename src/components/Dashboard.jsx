import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();
  const [togglestate,setToggleState]=useState(false)

  useEffect(() => {
    automaticDelete();
    fetchGroups();
  }, [togglestate]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (err) {
      setError('Failed to fetch groups');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('')
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/search?destination=${destination}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (err) {
      setError('Check the dates you have entered');
    }
  };

  const createGroup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/groups', {
        destination,
        date
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/group/${response.data._id}`);
    } catch (err) {
      setError('Failed to create group');
    }
    console.log(response.data);
  };
  const joinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/api/groups/join/${groupId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/group/${groupId}`);
    } catch (err) {
      setError('Failed to join group');
    }
  };

  const openGroup = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      response&&navigate(`/group/${groupId}`)
      
    } catch (err) {
      console.error('Failed to fetch group details');
    }
      navigate(`/group/${groupId}`);
  }
  const leaveGroup = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
    } catch (err) {
      console.error('Failed to fetch group details');
    }
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
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Travel Group</h2>
        <p className="text-gray-600">Connect with fellow travelers heading to the same destination</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition"
              >
                Search Groups
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map(group => (
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
              <div className='flex px-2 gap-2'>
              {!group.members.some(member => member._id === group.userId) && (
              <button
                onClick={() => joinGroup(group._id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-500/50 transition"
              >
                Join Group
              </button>
              )}
              {group.members.some(member => member._id === group.userId) && (
              <button
                onClick={() => openGroup(group._id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-500/50 transition"
              >
                Open Group
              </button>
              )}
             {group.members.some(member => member._id === group.userId) && (
              <button
                onClick={() => leaveGroup(group._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-green-500/50 transition"
              >
                Leave
              </button>
              )}
              </div>
              
            </div>
          </div>
        ))}
      </div>
      
      {groups.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
          <p className="text-gray-600 mb-6">Be the first to create a group for this destination!</p>
          <button
            onClick={createGroup}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition"
          >
            Create New Group
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;