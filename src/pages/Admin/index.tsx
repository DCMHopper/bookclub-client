import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import supabase from '../../supabaseClient';
import './style.css';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from 'jsonwebtoken';

interface Reading {
  id: number;
  club_id: string;
  title: string;
  reading_desc: string;
  supplements?: any;
}

interface Meeting {
  id: number;
  club_id: string;
  reading_id: number;
  scheduled_for: string;
  section: string;
}

const formatDateTimeLocal = (date: string) => {
  return new Date(date).toISOString().slice(0, 16);
};

const Admin = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [clubId, setClubId] = useState<string | null>(null);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [newReading, setNewReading] = useState({
    title: '',
    reading_desc: '',
  });
  const [activeTab, setActiveTab] = useState('readings');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [newMeeting, setNewMeeting] = useState({
    reading_id: '',
    scheduled_for: '',
    section: '',
  });

  // Get club_id from JWT on component mount
  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const jwt = jwtDecode<JwtPayload>(session.access_token);
        setClubId(jwt.club_id ?? null);
      } else {
        setClubId(null);
      }
    });

    return () => {
      authListener.data?.subscription.unsubscribe();
    };
  }, []);

  // Fetch readings when clubId changes
  useEffect(() => {
    if (clubId) {
      fetchReadings();
      fetchMeetings();
    }
  }, [clubId]);

  const fetchReadings = async () => {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching readings:', error);
      return;
    }

    setReadings(data || []);
  };

  const fetchMeetings = async () => {
    if (!clubId) return;
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('club_id', clubId)
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error);
      return;
    }

    setMeetings(data || []);
  };

  const handleAddReading = async (e: Event) => {
    e.preventDefault();
    if (!clubId) return;

    const { data, error } = await supabase
      .from('readings')
      .insert([
        {
          club_id: clubId,
          title: newReading.title,
          reading_desc: newReading.reading_desc,
        }
      ])
      .select();

    if (error) {
      console.error('Error adding reading:', error);
      return;
    }

    setReadings([...(data || []), ...readings]);
    setNewReading({ title: '', reading_desc: '' });
  };

  const handleUpdateReading = async (e: Event) => {
    e.preventDefault();
    if (!editingReading) return;

    const { error } = await supabase
      .from('readings')
      .update({
        title: editingReading.title,
        reading_desc: editingReading.reading_desc,
      })
      .eq('id', editingReading.id);

    if (error) {
      console.error('Error updating reading:', error);
      return;
    }

    setReadings(readings.map(r => 
      r.id === editingReading.id ? editingReading : r
    ));
    setEditingReading(null);
  };

  const handleDeleteReading = async (id: number) => {
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reading:', error);
      return;
    }

    setReadings(readings.filter(r => r.id !== id));
  };

  const handleAddMeeting = async (e: Event) => {
    e.preventDefault();
    if (!clubId) return;

    const { data, error } = await supabase
      .from('meetings')
      .insert([
        {
          club_id: clubId,
          reading_id: parseInt(newMeeting.reading_id),
          scheduled_for: newMeeting.scheduled_for,
          section: newMeeting.section,
        }
      ])
      .select();

    if (error) {
      console.error('Error adding meeting:', error);
      return;
    }

    setMeetings([...(data || []), ...meetings]);
    setNewMeeting({ reading_id: '', scheduled_for: '', section: '' });
  };

  const handleUpdateMeeting = async (e: Event) => {
    e.preventDefault();
    if (!editingMeeting) return;

    const { error } = await supabase
      .from('meetings')
      .update({
        reading_id: editingMeeting.reading_id,
        scheduled_for: editingMeeting.scheduled_for,
        section: editingMeeting.section,
      })
      .eq('id', editingMeeting.id);

    if (error) {
      console.error('Error updating meeting:', error);
      return;
    }

    setMeetings(meetings.map(m => 
      m.id === editingMeeting.id ? editingMeeting : m
    ));
    setEditingMeeting(null);
  };

  const handleDeleteMeeting = async (id: number) => {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meeting:', error);
      return;
    }

    setMeetings(meetings.filter(m => m.id !== id));
  };

  return (
    <div class="admin-container">
      <div class="tab-navigation">
        <button 
          class={`tab-button ${activeTab === 'readings' ? 'active' : ''}`}
          onClick={() => setActiveTab('readings')}
        >
          Manage Readings
        </button>
        <button 
          class={`tab-button ${activeTab === 'meetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('meetings')}
        >
          Manage Meetings
        </button>
      </div>

      {activeTab === 'readings' ? (
        <section class="admin-section">
          <h2>Manage Readings</h2>

          {/* Add New Reading Form */}
          <form onSubmit={handleAddReading} class="admin-form">
            <h3>Add New Reading</h3>
            <input
              type="text"
              placeholder="Title"
              value={newReading.title}
              onChange={e => setNewReading({
                ...newReading,
                title: (e.target as HTMLInputElement).value
              })}
              required
            />
            <textarea
              placeholder="Description"
              value={newReading.reading_desc}
              onChange={e => setNewReading({
                ...newReading,
                reading_desc: (e.target as HTMLTextAreaElement).value
              })}
              required
            />
            <button type="submit">Add Reading</button>
          </form>

          {/* Edit Reading Form */}
          {editingReading && (
            <form onSubmit={handleUpdateReading} class="admin-form">
              <h3>Edit Reading</h3>
              <input
                type="text"
                placeholder="Title"
                value={editingReading.title}
                onChange={e => setEditingReading({
                  ...editingReading,
                  title: (e.target as HTMLInputElement).value
                })}
                required
              />
              <textarea
                placeholder="Description"
                value={editingReading.reading_desc}
                onChange={e => setEditingReading({
                  ...editingReading,
                  reading_desc: (e.target as HTMLTextAreaElement).value
                })}
                required
              />
              <div class="button-group">
                <button type="submit">Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => setEditingReading(null)}
                  class="cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Readings List */}
          <div class="readings-list">
            <h3>Current Readings</h3>
            {readings.map(reading => (
              <div key={reading.id} class="reading-item">
                <h4>{reading.title}</h4>
                <p>{reading.reading_desc}</p>
                <div class="button-group">
                  <button 
                    onClick={() => setEditingReading(reading)}
                    class="edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteReading(reading.id)}
                    class="delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section class="admin-section">
          <h2>Manage Meetings</h2>

          {/* Add New Meeting Form */}
          <form onSubmit={handleAddMeeting} class="admin-form">
            <h3>Add New Meeting</h3>
            <select
              value={newMeeting.reading_id}
              onChange={e => setNewMeeting({
                ...newMeeting,
                reading_id: (e.target as HTMLSelectElement).value
              })}
              required
            >
              <option value="">Select a Reading</option>
              {readings.map(reading => (
                <option key={reading.id} value={reading.id}>
                  {reading.title}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={newMeeting.scheduled_for}
              onChange={e => setNewMeeting({
                ...newMeeting,
                scheduled_for: (e.target as HTMLInputElement).value
              })}
              required
            />
            <input
              type="text"
              placeholder="Section"
              value={newMeeting.section}
              onChange={e => setNewMeeting({
                ...newMeeting,
                section: (e.target as HTMLInputElement).value
              })}
              required
            />
            <button type="submit">Add Meeting</button>
          </form>

          {/* Edit Meeting Form */}
          {editingMeeting && (
            <form 
              id="editMeetingForm"
              onSubmit={handleUpdateMeeting} 
              class="admin-form"
            >
              <h3>Edit Meeting</h3>
              <select
                value={editingMeeting.reading_id}
                onChange={e => setEditingMeeting({
                  ...editingMeeting,
                  reading_id: parseInt((e.target as HTMLSelectElement).value)
                })}
                required
              >
                {readings.map(reading => (
                  <option key={reading.id} value={reading.id}>
                    {reading.title}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={editingMeeting.scheduled_for}
                onChange={e => setEditingMeeting({
                  ...editingMeeting,
                  scheduled_for: (e.target as HTMLInputElement).value
                })}
                required
              />
              <input
                type="text"
                placeholder="Section"
                value={editingMeeting.section}
                onChange={e => setEditingMeeting({
                  ...editingMeeting,
                  section: (e.target as HTMLInputElement).value
                })}
                required
              />
              <div class="button-group">
                <button type="submit">Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => setEditingMeeting(null)}
                  class="cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Meetings List */}
          <div class="meetings-list">
            <h3>Current Meetings</h3>
            {meetings.map(meeting => {
              const reading = readings.find(r => r.id === meeting.reading_id);
              
              if (editingMeeting?.id === meeting.id) {
                return (
                  <form 
                    key={meeting.id}
                    onSubmit={handleUpdateMeeting} 
                    class="meeting-item editing"
                  >
                    <select
                      value={editingMeeting.reading_id}
                      onChange={e => setEditingMeeting({
                        ...editingMeeting,
                        reading_id: parseInt((e.target as HTMLSelectElement).value)
                      })}
                      required
                    >
                      {readings.map(reading => (
                        <option key={reading.id} value={reading.id}>
                          {reading.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={editingMeeting.scheduled_for}
                      onChange={e => setEditingMeeting({
                        ...editingMeeting,
                        scheduled_for: (e.target as HTMLInputElement).value
                      })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Section"
                      value={editingMeeting.section}
                      onChange={e => setEditingMeeting({
                        ...editingMeeting,
                        section: (e.target as HTMLInputElement).value
                      })}
                      required
                    />
                    <div class="button-group">
                      <button type="submit">Save</button>
                      <button 
                        type="button" 
                        onClick={() => setEditingMeeting(null)}
                        class="cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div key={meeting.id} class="meeting-item">
                  <h4>{reading?.title}</h4>
                  <p class="section-subtitle">{meeting.section}</p>
                  <p class="meeting-time">
                    <strong>Scheduled For:</strong> {new Date(meeting.scheduled_for).toLocaleString()}
                  </p>
                  <div class="button-group">
                    <button 
                      onClick={() => setEditingMeeting({
                        ...meeting,
                        scheduled_for: formatDateTimeLocal(meeting.scheduled_for)
                      })}
                      class="edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      class="delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Admin; 