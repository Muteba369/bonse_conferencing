import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import './Consultation.css';

export default function Consultation() {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);
  const [jitsiReady, setJitsiReady] = useState(false);

  // Get parameters from URL
  const room = searchParams.get('room');
  const token = searchParams.get('token');
  const name = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')) : 'Guest';

  useEffect(() => {
    // Validate parameters
    if (!room || !token) {
      setError('Invalid consultation link: missing room or token parameter');
      setIsValidating(false);
      return;
    }

    setIsValidating(false);
  }, [room, token]);

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

  return (
    <div className="consultation-container">
      {!jitsiReady && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading video conference...</p>
        </div>
      )}

      <JitsiMeeting
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
  );
}
