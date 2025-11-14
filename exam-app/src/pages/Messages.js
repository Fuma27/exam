import { useState, useEffect } from 'react';
import { api, handleApiError } from '../utils/api';
import '../styles/Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'important'

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching messages...');
      
      // Using the api utility that already returns parsed data
      const data = await api.getMessages();
      
      // Validate and set data
      if (data && Array.isArray(data)) {
        // Sort messages by timestamp, newest first
        const sortedMessages = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(sortedMessages);
        console.log('✅ Messages loaded:', sortedMessages.length);
      } else {
        console.warn('⚠️ Unexpected data format:', data);
        setMessages([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      const errorMessage = handleApiError(error, 'Failed to load messages');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      setError(null);
      console.log('📬 Marking message as read:', messageId);
      
      await api.markMessageRead(messageId);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, read: true }));
      }
      
      console.log('✅ Message marked as read');
      
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      const errorMessage = handleApiError(error, 'Failed to mark message as read');
      setError(errorMessage);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setError(null);
      console.log('🗑️ Deleting message:', messageId);
      
      if (window.confirm('Are you sure you want to delete this message?')) {
        await api.deleteMessage(messageId);
        
        // Update local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
        
        console.log('✅ Message deleted successfully');
      }
      
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      const errorMessage = handleApiError(error, 'Failed to delete message');
      setError(errorMessage);
      throw error;
    }
  };

  const markAsImportant = async (messageId, important) => {
    try {
      setError(null);
      console.log('⭐ Toggling importance for message:', messageId, important);
      
      await api.markMessageImportant(messageId, important);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, important } : msg
      ));
      
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, important }));
      }
      
      console.log('✅ Message importance updated');
      
    } catch (error) {
      console.error('❌ Error updating message importance:', error);
      const errorMessage = handleApiError(error, 'Failed to update message importance');
      setError(errorMessage);
    }
  };

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter messages based on current filter
  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'unread':
        return !message.read;
      case 'important':
        return message.important;
      default:
        return true;
    }
  });

  // Count unread messages
  const unreadCount = messages.filter(msg => !msg.read).length;

  // Count messages by type
  const verificationCount = messages.filter(msg => msg.type === 'verification').length;
  const examUpdateCount = messages.filter(msg => msg.type === 'exam_update').length;
  const systemCount = messages.filter(msg => msg.type === 'system').length;

  // Get message icon based on type
  const getMessageIcon = (type) => {
    switch (type) {
      case 'verification':
        return 'fas fa-shield-alt';
      case 'exam_update':
        return 'fas fa-calendar-alt';
      case 'system':
        return 'fas fa-cog';
      default:
        return 'fas fa-envelope';
    }
  };

  // Get message type label
  const getMessageTypeLabel = (type) => {
    switch (type) {
      case 'verification':
        return 'Verification Code';
      case 'exam_update':
        return 'Exam Update';
      case 'system':
        return 'System Notification';
      default:
        return 'Message';
    }
  };

  // Get message type color
  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'verification':
        return '#4caf50'; // Green
      case 'exam_update':
        return '#2196f3'; // Blue
      case 'system':
        return '#ff9800'; // Orange
      default:
        return '#00bcd4'; // Cyan
    }
  };

  // Extract verification code from message body
  const extractVerificationCode = (body) => {
    const codeMatch = body.match(/\b[A-Z0-9]{6,12}\b/g);
    return codeMatch ? codeMatch[0] : null;
  };

  // Format message body with better readability
  const formatMessageBody = (body, type) => {
    if (type === 'verification') {
      const code = extractVerificationCode(body);
      if (code) {
        return body.replace(code, `<strong class="verification-code">${code}</strong>`);
      }
    }
    return body;
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-header">
          <h2>Messages & Notifications</h2>
          <button className="btn btn-primary" onClick={fetchMessages} disabled>
            <i className="fas fa-redo"></i> Refresh
          </button>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <div className="header-left">
          <h2>Messages & Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchMessages}>
            <i className="fas fa-redo"></i> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button className="retry-btn" onClick={fetchMessages}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      )}

      <div className="messages-content">
        <div className="messages-sidebar">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <i className="fas fa-inbox"></i> All Messages
              <span className="count-badge">{messages.length}</span>
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              <i className="fas fa-envelope"></i> Unread
              {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
            </button>
            <button 
              className={`filter-btn ${filter === 'important' ? 'active' : ''}`}
              onClick={() => setFilter('important')}
            >
              <i className="fas fa-star"></i> Important
            </button>
          </div>

          <div className="message-types">
            <h4>Message Types</h4>
            <div className="type-filters">
              <button 
                className="type-filter-btn"
                onClick={() => setFilter('all')}
              >
                <i className="fas fa-envelope"></i>
                <span>All Messages</span>
                <span className="type-count">{messages.length}</span>
              </button>
              <button 
                className="type-filter-btn"
                onClick={() => {
                  const verificationMessages = messages.filter(msg => msg.type === 'verification');
                  setSelectedMessage(verificationMessages[0] || null);
                }}
              >
                <i className="fas fa-shield-alt" style={{color: '#4caf50'}}></i>
                <span>Verification Codes</span>
                <span className="type-count">{verificationCount}</span>
              </button>
              <button 
                className="type-filter-btn"
                onClick={() => {
                  const examMessages = messages.filter(msg => msg.type === 'exam_update');
                  setSelectedMessage(examMessages[0] || null);
                }}
              >
                <i className="fas fa-calendar-alt" style={{color: '#2196f3'}}></i>
                <span>Exam Updates</span>
                <span className="type-count">{examUpdateCount}</span>
              </button>
              <button 
                className="type-filter-btn"
                onClick={() => {
                  const systemMessages = messages.filter(msg => msg.type === 'system');
                  setSelectedMessage(systemMessages[0] || null);
                }}
              >
                <i className="fas fa-cog" style={{color: '#ff9800'}}></i>
                <span>System Notifications</span>
                <span className="type-count">{systemCount}</span>
              </button>
            </div>
          </div>

          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox empty-icon"></i>
                <p>No messages found</p>
                <small>You're all caught up!</small>
              </div>
            ) : (
              filteredMessages.map(message => (
                <div 
                  key={message.id}
                  className={`message-item ${selectedMessage?.id === message.id ? 'active' : ''} ${!message.read ? 'unread' : ''} type-${message.type}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <div className="message-preview">
                    <div className="message-header">
                      <div className="message-type-indicator">
                        <i 
                          className={getMessageIcon(message.type)} 
                          style={{color: getMessageTypeColor(message.type)}}
                        ></i>
                      </div>
                      <strong>{message.sender || 'System'}</strong>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="message-type-badge">
                      {getMessageTypeLabel(message.type)}
                    </div>
                    <p className="message-subject">{message.subject}</p>
                    <p className="message-excerpt">
                      {message.body.substring(0, 80)}...
                    </p>
                  </div>
                  <div className="message-indicators">
                    {!message.read && <div className="unread-dot"></div>}
                    {message.important && <i className="fas fa-star important-icon"></i>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <div className="message-view">
              <div className="message-view-header">
                <div className="message-info">
                  <div className="message-type-header">
                    <i 
                      className={getMessageIcon(selectedMessage.type)} 
                      style={{color: getMessageTypeColor(selectedMessage.type)}}
                    ></i>
                    <span className="message-type-label">
                      {getMessageTypeLabel(selectedMessage.type)}
                    </span>
                  </div>
                  <h3>{selectedMessage.subject}</h3>
                  <div className="message-meta">
                    <span className="sender">From: {selectedMessage.sender || 'System Administrator'}</span>
                    <span className="timestamp">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="message-actions">
                  {selectedMessage.type === 'verification' && (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        const code = extractVerificationCode(selectedMessage.body);
                        if (code) {
                          navigator.clipboard.writeText(code);
                          alert('Verification code copied to clipboard!');
                        }
                      }}
                    >
                      <i className="fas fa-copy"></i> Copy Code
                    </button>
                  )}
                  <button 
                    className={`btn btn-sm ${selectedMessage.important ? 'btn-warning' : 'btn-outline'}`}
                    onClick={() => markAsImportant(selectedMessage.id, !selectedMessage.important)}
                  >
                    <i className={`fas ${selectedMessage.important ? 'fa-star' : 'fa-star'}`}></i>
                    {selectedMessage.important ? ' Important' : ' Mark Important'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
              
              <div className="message-body">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageBody(selectedMessage.body, selectedMessage.type) 
                  }} 
                />
                
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="attachments">
                    <h4>Attachments:</h4>
                    <div className="attachment-list">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <i className="fas fa-paperclip"></i>
                          <span>{attachment.name}</span>
                          <button className="btn btn-sm btn-outline">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMessage.type === 'verification' && (
                  <div className="verification-help">
                    <h4>💡 Verification Code Help</h4>
                    <p>Use this code to verify your identity during exams or when accessing exam materials.</p>
                    <ul>
                      <li>Keep this code confidential</li>
                      <li>Use it only for its intended purpose</li>
                      <li>Codes expire after 24 hours</li>
                    </ul>
                  </div>
                )}

                {selectedMessage.type === 'exam_update' && (
                  <div className="exam-update-help">
                    <h4>📝 Exam Update Information</h4>
                    <p>This message contains important information about your upcoming exams.</p>
                    <ul>
                      <li>Check for schedule changes</li>
                      <li>Note any venue updates</li>
                      <li>Review special instructions</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-message-selected">
              <i className="fas fa-envelope-open-text empty-icon"></i>
              <h4>Select a Message</h4>
              <p>Choose a message from the list to view its contents</p>
              <div className="message-types-overview">
                <div className="overview-card">
                  <i className="fas fa-shield-alt" style={{color: '#4caf50'}}></i>
                  <h5>Verification Codes</h5>
                  <p>Security codes for exam verification</p>
                  <span className="overview-count">{verificationCount}</span>
                </div>
                <div className="overview-card">
                  <i className="fas fa-calendar-alt" style={{color: '#2196f3'}}></i>
                  <h5>Exam Updates</h5>
                  <p>Schedule changes and important updates</p>
                  <span className="overview-count">{examUpdateCount}</span>
                </div>
                <div className="overview-card">
                  <i className="fas fa-cog" style={{color: '#ff9800'}}></i>
                  <h5>System Notifications</h5>
                  <p>Important system announcements</p>
                  <span className="overview-count">{systemCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;