import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JaaSMeeting } from '@jitsi/react-sdk';
import './Consultation.css';

export default function Consultation() {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [token, setToken] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);

  // Get parameters from URL
  const room = searchParams.get('room');
  const name = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')) : 'Guest';
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://bonse-backend.onrender.com';

  useEffect(() => {
    // Validate room parameter
    if (!room) {
      setError('Invalid consultation link: missing room parameter');
      setIsValidating(false);
      return;
    }

    // Track loading time
    const startTime = Date.now();
    const timer = setInterval(() => {
      setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Call backend to create/join room and get JWT token
    const initializeRoom = async () => {
      try {
        console.log(`Initializing room: ${room}`);

        // Call backend endpoint to create or join room
        const response = await fetch(
          `${backendUrl}/api/video/rooms/${encodeURIComponent(room)}/?name=${encodeURIComponent(name)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Room response:', data);

        // Set the token and room status
        setToken(data.token);
        setRoomStatus(data.action); // 'create' or 'join'

        // Show message based on action
        if (data.action === 'create') {
          console.log('Room created successfully');
        } else if (data.action === 'join') {
          console.log('Joining existing room');
        }

        setIsValidating(false);
      } catch (err) {
        console.error('Error initializing room:', err);
        setError(`Failed to initialize video room: ${err.message}`);
        setIsValidating(false);
      }
    };

    initializeRoom();

    return () => clearInterval(timer);
  }, [room, name, backendUrl]);

  const handleApiReady = (externalApi) => {
    console.log('Jitsi API is ready');
    setJitsiReady(true);

    // Optional: Add event listeners to the API
    externalApi.addEventListener('readyToClose', () => {
      console.log('Call ended');
      handleCallEnded();
    });

    externalApi.addEventListener('videoConferenceJoined', (event) => {
      console.log('Video conference joined:', event);
    });

    externalApi.addEventListener('participantJoined', (event) => {
      console.log('Participant joined:', event);
    });

    externalApi.addEventListener('participantLeft', (event) => {
      console.log('Participant left:', event);
    });

    externalApi.addEventListener('conferenceLeft', () => {
      console.log('Conference left');
    });

    externalApi.addEventListener('audioMuted', () => {
      console.log('Audio muted');
    });

    externalApi.addEventListener('audioUnmuted', () => {
      console.log('Audio unmuted');
    });

    externalApi.addEventListener('videoMuted', () => {
      console.log('Video muted');
    });

    externalApi.addEventListener('videoUnmuted', () => {
      console.log('Video unmuted');
    });

    externalApi.addEventListener('screenSharingStatusChanged', (event) => {
      console.log('Screen sharing status:', event.detail.on);
    });

    externalApi.addEventListener('errorOccurred', (event) => {
      console.error('Jitsi Error:', event);
    });
  };

  const handleCallEnded = () => {
    // Show "Call Ended" message
    setTimeout(() => {
      window.location.href = '/call-complete';
    }, 1000);
  };

  // Show validation/loading state
  if (isValidating) {
    return (
      <div className="consultation-container loading">
        <div className="spinner"></div>
        <p>Initializing consultation...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="consultation-container error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Invalid Consultation Link</h2>
          <p>{error}</p>
          <div className="error-details">
            <p>
              Make sure you have accessed this link from the Bonse Hub Connect mobile app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while waiting for token
  if (!token) {
    return (
      <div className="consultation-container loading">
        <div className="spinner"></div>
        <p>Setting up {roomStatus === 'create' ? 'new' : ''} video conference...</p>
        {loadingTime > 5 && <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>Connecting ({loadingTime}s)</p>}
        {loadingTime > 15 && <p style={{ marginTop: '10px', fontSize: '12px', color: '#f44' }}>Taking longer than expected. Check browser console for errors.</p>}
      </div>
    );
  }

  return (
    <div className="consultation-container">
      {!jitsiReady && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading video conference...</p>
          {loadingTime > 10 && <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>Still loading ({loadingTime}s)</p>}
          {loadingTime > 20 && <p style={{ marginTop: '10px', fontSize: '12px', color: '#f44' }}>This is taking longer than expected.<br/>Try refreshing the page or checking console (F12).</p>}
        </div>
      )}

      <div className="jitsi-meeting-container">
        <JaaSMeeting
          appId='vpaas-magic-cookie-e0639374f5fa4303a76309ce45dcb7be'
          roomName={room}
          jwt={token}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableAudioLevels: false,
            enableLayerSuspension: true,
            disableSimulcast: false,
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            DISPLAY_WELCOME_PAGE: false,
            TOOLBAR_TIMEOUT: 4000,
            DEFAULT_BACKGROUND: '#000',
            SHOW_CHROME_EXTENSION_BANNER: false,
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'fullscreen',
              'hangup',
              'settings',
              'stats',
            ],
          }}
          userInfo={{
            displayName: name,
          }}
          onApiReady={handleApiReady}
          onReadyToClose={() => {
            console.log('Ready to close');
            handleCallEnded();
          }}
          getIFrameRef={(iframeRef) => {
            console.log('iFrame reference:', iframeRef);
          }}
        />
      </div>
    </div>
  );
}
