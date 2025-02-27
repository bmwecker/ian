'use client';

import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar from '@heygen/streaming-avatar';
import { config } from '@/app/config/config';

// Добавим типы для Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AvatarComponent = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const avatarRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'ru-RU';

        recognitionRef.current.onresult = async (event: any) => {
          const text = event.results[event.results.length - 1][0].transcript;
          if (avatarRef.current) {
            try {
              const response = await fetch('/api/heygen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
              });
              
              const data = await response.json();
              if (data.success) {
                await avatarRef.current.speak({
                  text: data.response,
                  taskType: 'repeat'
                });
              }
            } catch (error) {
              console.error('Error processing speech:', error);
            }
          }
        };
      }
    }
  }, []);

  const startSession = async () => {
    try {
      avatarRef.current = new StreamingAvatar({ 
        token: config.HEYGEN_API_KEY 
      });

      const sessionData = await avatarRef.current.createStartAvatar({
        quality: 'high',
        avatarName: config.AVATAR_CONFIG.avatarId,
        voice: {
          voiceId: config.AVATAR_CONFIG.voiceId,
        },
        language: config.AVATAR_CONFIG.language
      });

      setIsSessionActive(true);
      startListening();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    if (avatarRef.current) {
      await avatarRef.current.stopAvatar();
      avatarRef.current = null;
    }
    stopListening();
    setIsSessionActive(false);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video id="avatarVideo" autoPlay playsInline className="w-full max-w-lg rounded-lg shadow-lg" />
      
      <button
        onClick={isSessionActive ? endSession : startSession}
        className={`px-6 py-2 rounded-full text-white font-medium ${
          isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSessionActive ? 'Завершить диалог' : 'Начать диалог'}
      </button>

      {isListening && (
        <div className="text-sm text-gray-600">
          Слушаю...
        </div>
      )}
    </div>
  );
};
