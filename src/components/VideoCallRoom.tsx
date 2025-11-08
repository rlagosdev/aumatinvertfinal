import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import type { DailyCall } from '@daily-co/daily-js';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';

interface VideoCallRoomProps {
  roomUrl: string;
  onLeave: () => void;
  userName?: string;
}

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ roomUrl, onLeave, userName = 'Utilisateur' }) => {
  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!containerRef.current) return;

        // Créer l'iframe Daily
        const callFrame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          },
          showLeaveButton: false,
          showFullscreenButton: true,
        });

        callFrameRef.current = callFrame;

        // Écouter les événements
        callFrame
          .on('joined-meeting', () => {
            console.log('✅ Rejoint la réunion');
            setIsJoining(false);
          })
          .on('left-meeting', () => {
            console.log('👋 Quitté la réunion');
            onLeave();
          })
          .on('error', (error) => {
            console.error('❌ Erreur Daily:', error);
            setError('Erreur de connexion. Veuillez réessayer.');
            setIsJoining(false);
          });

        // Rejoindre la salle
        await callFrame.join({
          url: roomUrl,
          userName: userName,
        });

      } catch (err: any) {
        console.error('Erreur lors de l\'initialisation:', err);
        setError(err.message || 'Impossible de rejoindre l\'appel');
        setIsJoining(false);
      }
    };

    initializeCall();

    // Nettoyage
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [roomUrl, userName, onLeave]);

  const toggleAudio = async () => {
    if (!callFrameRef.current) return;

    try {
      const newState = !isAudioEnabled;
      await callFrameRef.current.setLocalAudio(newState);
      setIsAudioEnabled(newState);
    } catch (err) {
      console.error('Erreur toggle audio:', err);
    }
  };

  const toggleVideo = async () => {
    if (!callFrameRef.current) return;

    try {
      const newState = !isVideoEnabled;
      await callFrameRef.current.setLocalVideo(newState);
      setIsVideoEnabled(newState);
    } catch (err) {
      console.error('Erreur toggle vidéo:', err);
    }
  };

  const toggleScreenShare = async () => {
    if (!callFrameRef.current) return;

    try {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare();
      } else {
        await callFrameRef.current.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      console.error('Erreur partage d\'écran:', err);
    }
  };

  const leaveCall = async () => {
    if (!callFrameRef.current) return;

    try {
      await callFrameRef.current.leave();
    } catch (err) {
      console.error('Erreur en quittant:', err);
      onLeave();
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-zinc-800 mb-2">Erreur de connexion</h2>
          <p className="text-zinc-600 mb-4">{error}</p>
          <button
            onClick={onLeave}
            className="px-6 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Zone vidéo */}
      <div ref={containerRef} className="w-full h-full relative">
        {isJoining && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Connexion en cours...</p>
            </div>
          </div>
        )}
      </div>

      {/* Contrôles */}
      {!isJoining && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
            {/* Toggle Audio */}
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                isAudioEnabled
                  ? 'bg-zinc-700 hover:bg-zinc-600'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isAudioEnabled ? 'Couper le micro' : 'Activer le micro'}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Toggle Video */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                isVideoEnabled
                  ? 'bg-zinc-700 hover:bg-zinc-600'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isVideoEnabled ? 'Arrêter la caméra' : 'Activer la caméra'}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Toggle Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all ${
                isScreenSharing
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
              title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-6 h-6 text-white" />
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Leave Call */}
            <button
              onClick={leaveCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
              title="Raccrocher"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
