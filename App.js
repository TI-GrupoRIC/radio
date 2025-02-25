import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

const RADIO_URL = 'https://r15.ciclano.io/proxy/radiofmi/stream';

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function configureAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS, // Corrigido aqui
      });
      console.log('Configuração de áudio aplicada com sucesso!');
    } catch (error) {
      console.error('Erro ao configurar o áudio:', error);
      setMessage('Erro ao configurar o áudio.');
    }
  }

  async function playAudio() {
    setMessage('');
    setLoading(true);
  
    try {
      await configureAudio();

      if (!sound) {
        console.log('Carregando nova instância do som...');
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: RADIO_URL },
          { shouldPlay: true }
        );

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            console.log('Erro ao carregar áudio:', status.error);
            setMessage('Erro ao carregar áudio.');
          } else {
            console.log('Áudio carregado com sucesso!');
          }
        });

        setSound(newSound);
        setIsPlaying(true);
        setMessage('Reproduzindo com sucesso!');
      } else {
        console.log('Tocando áudio já carregado...');
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setMessage('Erro ao reproduzir áudio.');
    }

    setLoading(false);
  }

  async function pauseAudio() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      setMessage('Reprodução pausada.');
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        console.log('Descarregando áudio...');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Rádio Online</Text>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title={isPlaying ? 'Pausar' : 'Tocar'} onPress={isPlaying ? pauseAudio : playAudio} />
      )}
      <Text style={{ marginTop: 10, color: 'red' }}>{message}</Text>
    </View>
  );
}
