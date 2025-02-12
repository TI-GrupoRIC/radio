import React, { useState, useEffect } from 'react';
import { View, Text, Button, ProgressBarAndroid, Platform, ProgressViewIOS } from 'react-native';
import { Audio } from 'expo-av';

const RADIO_STREAM = 'https://r15.ciclano.io/proxy/radiofmi/stream';

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffer, setBuffer] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  async function loadAndPlay() {
    try {
      setError(null);
      const { sound } = await Audio.Sound.createAsync(
        { uri: RADIO_STREAM },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(sound);
      setIsPlaying(true);
    } catch (err) {
      setError(err.message);
    }
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      setBuffer(status.positionMillis / (status.durationMillis || 1));
    } else if (status.error) {
      setError(status.error);
    }
  }

  async function togglePlayPause() {
    if (!sound) {
      await loadAndPlay();
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayPause} />
      {Platform.OS === 'android' ? (
        <ProgressBarAndroid styleAttr='Horizontal' progress={buffer} indeterminate={false} />
      ) : (
        <ProgressViewIOS progress={buffer} />
      )}
      {error && <Text style={{ color: 'red' }}>Erro: {error}</Text>}
    </View>
  );
}