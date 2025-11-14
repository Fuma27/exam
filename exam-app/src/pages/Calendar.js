import { useState, useEffect } from 'react';
import { api, handleApiError } from '../utils/api';
import '../styles/Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'list'

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching calendar events...');
      
      const data = await api.getCalendarEvents();
      
      if (data && Array.isArray(data)) {
        setEvents(data);
        console.log('✅ Calendar events loaded:', data.length);
      } else {
        console.warn('⚠️ Unexpected data format:', data);
        setEvents([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching calendar events:', error);
      const errorMessage = handleApiError(error, 'Failed to load calendar events');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData) => {
    try {
      setError(null);
      console.log('➕ Adding new event:', eventData);
      
      const newEvent = await api.post('/calendar/events', eventData);
      setEvents(prev => [...prev, newEvent]);
      console.log('✅ Event added successfully');
      
      return newEvent;
    } catch (error) {
      console.error('❌ Error adding event:', error);
      const errorMessage = handleApiError(error, 'Failed to add event');
      setError(errorMessage);
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setError(null);
      console.log('🗑️ Deleting event:', eventId);
      
      await api.delete(`/calendar/events/${eventId}`);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      console.log('✅ Event deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      const errorMessage = handleApiError(error, 'Failed to delete event');
      setError(errorMessage);
      throw error;
    }
  };

  // Calendar navigation functions
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Calendar generation functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push(date);
    }

    return days;
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Get event type styling
  const getEventTypeClass = (eventType) => {
    switch (eventType) {
      case 'exam': return 'event-type-exam';
      case 'deadline': return 'event-type-deadline';
      case 'announcement': return 'event-type-announcement';
      default: return 'event-type-general';
    }
  };

  // Group events by date for sidebar
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>Academic Calendar</h2>
          <button className="btn btn-primary" onClick={fetchCalendarEvents} disabled>
            <i className="fas fa-redo"></i> Refresh
          </button>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading calendar events...</p>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const today = new Date();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Academic Calendar</h2>
        <div className="calendar-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              <i className="fas fa-calendar-alt"></i> Month
            </button>
            <button 
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <i className="fas fa-list"></i> List
            </button>
          </div>
          <button className="btn btn-outline" onClick={fetchCalendarEvents}>
            <i className="fas fa-redo"></i> Refresh
          </button>
          <button className="btn btn-primary" onClick={navigateToday}>
            <i className="fas fa-calendar-day"></i> Today
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button className="retry-btn" onClick={fetchCalendarEvents}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      )}

      <div className="calendar-content">
        <div className="calendar-sidebar">
          <h3>Upcoming Events</h3>
          {Object.keys(eventsByDate).length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times empty-icon"></i>
              <p>No upcoming events</p>
            </div>
          ) : (
            <div className="upcoming-events">
              {Object.entries(eventsByDate)
                .filter(([date]) => new Date(date) >= new Date(today.toDateString()))
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .slice(0, 5)
                .map(([date, dateEvents]) => (
                  <div key={date} className="date-group">
                    <h4>{new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</h4>
                    {dateEvents.map(event => (
                      <div key={event.id} className="event-preview">
                        <strong>{event.title}</strong>
                        <span>{formatTime(event.time)}</span>
                        <span className={`event-type-badge ${getEventTypeClass(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="calendar-main">
          {view === 'month' ? (
            <div className="calendar-month">
              <div className="month-header">
                <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h3>
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <button className="nav-btn" onClick={() => navigateMonth('next')}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div className="calendar-grid">
                {/* Weekday headers */}
                <div className="calendar-weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday-header">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="calendar-days">
                  {calendarDays.map((date, index) => {
                    const isToday = date && date.toDateString() === today.toDateString();
                    const isSelected = date && date.toDateString() === selectedDate.toDateString();
                    const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();
                    const dayEvents = date ? getEventsForDate(date) : [];
                    
                    return (
                      <div
                        key={index}
                        className={`calendar-day ${
                          !date ? 'empty' : ''
                        } ${
                          !isCurrentMonth ? 'other-month' : ''
                        } ${
                          isToday ? 'today' : ''
                        } ${
                          isSelected ? 'selected' : ''
                        }`}
                        onClick={() => date && setSelectedDate(date)}
                      >
                        {date && (
                          <>
                            <div className="day-number">
                              {date.getDate()}
                            </div>
                            <div className="day-events">
                              {dayEvents.slice(0, 3).map(event => (
                                <div
                                  key={event.id}
                                  className={`calendar-event ${getEventTypeClass(event.type)}`}
                                  title={`${event.title} at ${formatTime(event.time)}`}
                                >
                                  <span className="event-time">{formatTime(event.time)}</span>
                                  <span className="event-title">{event.title}</span>
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="more-events">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Events */}
              {selectedDate && (
                <div className="selected-date-events">
                  <h4>
                    Events for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="no-events-message">No events scheduled for this date</p>
                  ) : (
                    <div className="date-events-list">
                      {getEventsForDate(selectedDate).map(event => (
                        <div key={event.id} className="date-event-item">
                          <div className="event-time-badge">
                            {formatTime(event.time)}
                          </div>
                          <div className="event-details">
                            <strong>{event.title}</strong>
                            {event.venue && <span>at {event.venue}</span>}
                            {event.description && <p>{event.description}</p>}
                          </div>
                          <div className="event-actions">
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteEvent(event.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="events-list">
              <h3>All Events ({events.length})</h3>
              {events.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-calendar-times empty-icon"></i>
                  <h4>No Events Scheduled</h4>
                  <p>There are no calendar events scheduled yet.</p>
                </div>
              ) : (
                <div className="events-grid">
                  {events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h4>{event.title}</h4>
                        <span className="event-date">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="event-details">
                        <p><i className="fas fa-clock"></i> {formatTime(event.time)}</p>
                        <p><i className="fas fa-map-marker-alt"></i> {event.venue || 'Online'}</p>
                        {event.description && (
                          <p className="event-description">{event.description}</p>
                        )}
                        <div className={`event-type ${getEventTypeClass(event.type)}`}>
                          {event.type}
                        </div>
                      </div>
                      <div className="event-actions">
                        <button className="btn btn-sm btn-outline">
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;