import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

function GroupChat() {
  const { id } = useParams();
  const { token } = useAuth();
  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join_group', id);

    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    fetchGroupDetails();
    
    return () => socketRef.current.disconnect();
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(response.data);
      setMessages(response.data.messages);
      setLoading(false);
      setLoadingMessages(false);
      scrollToBottom();
    } catch (err) {
      setError('Failed to fetch group details');
      setLoading(false);
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/groups/${id}/messages`, {
        content: message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      socketRef.current.emit('send_message', response.data);
      setMessage('');
      window.location.reload();
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">{error}</p>
    </div>
  );

  if (!group || loadingMessages) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Loading messages...</p>
    </div>
  );
  console.log(messages)
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{group.destination}</h2>
            <p className="text-gray-600">
              {new Date(group.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-lg">
            <p className="text-indigo-700 font-medium">
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
 </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-bubble ${msg.sender && msg.sender._id === group.creator ? 'message-mine' : 'message-other'}`}>
                    {msg.sender ? (
                      
                        <p className="font-medium text-sm mb-1">{msg.sender.username}</p>
                      ) : (
                      <p>Sender information unavailable</p>
              
                    )}
                        <p>{msg.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      
                    
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Members</h3>
          <div className="space-y-4">
            {group.members.map(member => (
              <div key={member._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                  {member.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.username}</p>
                  {member._id === group.creator && (
                    <p className="text-xs text-indigo-600">Group Creator</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;