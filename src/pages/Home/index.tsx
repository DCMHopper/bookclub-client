import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import supabase from '../../supabaseClient';
import { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import './style.css';

const Home = () => {
  const [meetings, setMeetings] = useState([]);
  const [readings, setReadings] = useState({});
  const [nextMeeting, setNextMeeting] = useState(null);
  const [clubId, setClubId] = useState(null);

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

  useEffect(() => {
    if (!clubId) {
      console.error('clubId is undefined');
      return;
    }

    const fetchMeetingsAndReadings = async () => {
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*, clubs(meeting_room)')
        .eq('club_id', clubId)
        .order('scheduled_for', { ascending: true });

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
        return;
      }

      const upcomingMeetings = meetingsData.filter(meeting => new Date(meeting.scheduled_for) > new Date());
      setMeetings(upcomingMeetings);
      if (upcomingMeetings.length > 0) {
        setNextMeeting(upcomingMeetings[0]);
      }

      const readingIds = [...new Set(upcomingMeetings.map(meeting => meeting.reading_id))];
      if (readingIds.length > 0) {
        const { data: readingsData, error: readingsError } = await supabase
          .from('readings')
          .select('*')
          .in('id', readingIds);

        if (readingsError) {
          console.error('Error fetching readings:', readingsError);
          return;
        }

        const readingsMap = readingsData.reduce((acc, reading) => {
          acc[reading.id] = reading;
          return acc;
        }, {});

        setReadings(readingsMap);
      }
    };

    fetchMeetingsAndReadings();
  }, [clubId]);

  const signIn = async () => {
	const {data, error} = await supabase.auth.signInWithPassword({
		email: import.meta.env.VITE_TEST_EMAIL,
		password: import.meta.env.VITE_TEST_PASS
	});
	if (error) {
		console.error('Sign in error: ', error);
		console.log(import.meta.env.VITE_TEST_EMAIL);
	}
	return error;
  };

  const signOut = async () => {
	const {error} = await supabase.auth.signOut();
	if (error) {
		console.error('Sign in error: ', error);
		console.log(import.meta.env.VITE_TEST_EMAIL);
	} else {
		window.location.reload();
	}
	return error;
  };

  return (
    <div class="dashboard">
		<button onClick={signIn}>Sign In</button>
		<button onClick={signOut}>Sign Out</button>
      {nextMeeting && readings[nextMeeting.reading_id] && (
        <div class="callout-box">
          <h2>Next Meeting</h2>
          <h3 class="reading-title">{readings[nextMeeting.reading_id].title}</h3>
          <p class="section-subtitle">{nextMeeting.section}</p>
          <p class="reading-description">{readings[nextMeeting.reading_id].reading_desc}</p>
          <p class="meeting-time">
            <strong>Scheduled For:</strong> {new Date(nextMeeting.scheduled_for).toLocaleString()}
          </p>
          <a 
            href={nextMeeting.clubs.meeting_room} 
            class="meeting-room-button" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Join Meeting Room
          </a>
        </div>
      )}

      <div class="meetings-list">
        <h2>Upcoming Meetings</h2>
        {meetings.length > 0 ? (
          <ul class="meetings-list">
            {meetings.map((meeting) => (
              readings[meeting.reading_id] ? (
                <li class="meeting-item" key={meeting.id}>
                  <h3 class="reading-title">{readings[meeting.reading_id].title}</h3>
                  <p class="section-subtitle">{meeting.section}</p>
                  <p class="reading-description">{readings[meeting.reading_id].reading_desc}</p>
                  <p class="meeting-time"><strong>Scheduled For:</strong> {new Date(meeting.scheduled_for).toLocaleString()}</p>
                </li>
              ) : null
            ))}
          </ul>
        ) : (
          <p>No upcoming meetings scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default Home;