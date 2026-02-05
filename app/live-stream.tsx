import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, Pause, Maximize, Camera, Wifi, WifiOff, RotateCw, AlertCircle } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';

// Mock camera data - in real app, this would come from route params
const mockCamera = {
  id: 1,
  name: 'Front Gate Camera',
  location: 'Main Entrance',
  ip: '192.168.1.101',
  port: 554,
  protocol: 'RTSP',
  status: 'online',
  streamUrl: 'rtsp://192.168.1.101:554/stream',
};

type StreamState = 'loading' | 'playing' | 'paused' | 'buffering' | 'error' | 'reconnecting';

export default function LiveStreamScreen() {
  const router = useRouter();
  const [streamState, setStreamState] = useState<StreamState>('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [bitrate, setBitrate] = useState('2.4 Mbps');
  const [fps, setFps] = useState(30);

  // Animation values
  const pulseScale = useSharedValue(1);
  const spinRotation = useSharedValue(0);

  useEffect(() => {
    // Simulate initial loading
    const loadTimer = setTimeout(() => {
      setStreamState('playing');
    }, 2000);

    // Simulate dynamic bitrate and FPS changes
    const statsInterval = setInterval(() => {
      const rates = ['2.4 Mbps', '2.1 Mbps', '2.6 Mbps', '2.3 Mbps'];
      const fpsValues = [30, 28, 30, 29];
      setBitrate(rates[Math.floor(Math.random() * rates.length)]);
      setFps(fpsValues[Math.floor(Math.random() * fpsValues.length)]);
    }, 3000);

    // Pulse animation for recording indicator
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );

    return () => {
      clearTimeout(loadTimer);
      clearInterval(statsInterval);
    };
  }, []);

  // Spin animation for reconnecting
  useEffect(() => {
    if (streamState === 'reconnecting' || streamState === 'buffering') {
      spinRotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    }
  }, [streamState]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRotation.value}deg` }],
  }));

  const handlePlayPause = () => {
    if (streamState === 'playing') {
      setStreamState('paused');
    } else if (streamState === 'paused') {
      setStreamState('playing');
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // In real app, this would trigger native fullscreen mode
    Alert.alert(
      'Fullscreen Mode',
      isFullscreen ? 'Exiting fullscreen mode' : 'Entering fullscreen mode',
      [{ text: 'OK' }]
    );
  };

  const handleSnapshot = () => {
    // Simulate snapshot capture
    Alert.alert(
      'Snapshot Captured',
      `Snapshot saved successfully!\n\nCamera: ${mockCamera.name}\nTime: ${new Date().toLocaleString()}`,
      [
        { text: 'View Gallery', onPress: () => router.push('/snapshot-gallery') },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const handleReconnect = () => {
    setStreamState('reconnecting');
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        setStreamState('playing');
      } else {
        setStreamState('error');
        Alert.alert(
          'Connection Failed',
          'Unable to reconnect to camera. Please check:\n\n• Camera is powered on\n• Network connection is stable\n• Camera credentials are correct',
          [{ text: 'OK' }]
        );
      }
    }, 3000);
  };

  const renderStreamContent = () => {
    switch (streamState) {
      case 'loading':
        return (
          <View className="absolute inset-0 items-center justify-center bg-black/90">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-white text-lg font-semibold mt-4">Connecting to camera...</Text>
            <Text className="text-gray-400 text-sm mt-2">{mockCamera.streamUrl}</Text>
          </View>
        );

      case 'buffering':
        return (
          <View className="absolute inset-0 items-center justify-center bg-black/70">
            <Animated.View style={spinStyle}>
              <RotateCw size={48} color="#3b82f6" />
            </Animated.View>
            <Text className="text-white text-lg font-semibold mt-4">Buffering...</Text>
          </View>
        );

      case 'reconnecting':
        return (
          <View className="absolute inset-0 items-center justify-center bg-black/90">
            <Animated.View style={spinStyle}>
              <Wifi size={48} color="#3b82f6" />
            </Animated.View>
            <Text className="text-white text-lg font-semibold mt-4">Reconnecting...</Text>
            <Text className="text-gray-400 text-sm mt-2">Attempting to restore connection</Text>
          </View>
        );

      case 'error':
        return (
          <View className="absolute inset-0 items-center justify-center bg-black/90 px-6">
            <View className="bg-red-500/20 p-4 rounded-full mb-4">
              <WifiOff size={48} color="#ef4444" />
            </View>
            <Text className="text-white text-xl font-bold text-center">Connection Lost</Text>
            <Text className="text-gray-400 text-center mt-2 mb-6">
              Unable to connect to camera stream. The camera may be offline or unreachable.
            </Text>
            <TouchableOpacity
              onPress={handleReconnect}
              className="bg-primary px-8 py-3 rounded-lg flex-row items-center gap-2"
            >
              <RotateCw size={20} color="white" />
              <Text className="text-white font-semibold">Retry Connection</Text>
            </TouchableOpacity>
          </View>
        );

      case 'paused':
        return (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <View className="bg-white/20 p-6 rounded-full">
              <Pause size={48} color="white" />
            </View>
            <Text className="text-white text-lg font-semibold mt-4">Stream Paused</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Video Player Container */}
      <View className="flex-1 relative">
        {/* Simulated Video Feed - In real app, use react-native-video or WebRTC component */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=900&auto=format&fit=crop&q=60' }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Live Indicator */}
        {streamState === 'playing' && (
          <View className="absolute top-4 left-4 flex-row items-center gap-2 bg-black/60 px-3 py-2 rounded-full">
            <Animated.View style={pulseStyle}>
              <View className="w-2 h-2 bg-red-500 rounded-full" />
            </Animated.View>
            <Text className="text-white font-bold text-sm">LIVE</Text>
          </View>
        )}

        {/* Connection Quality Indicator */}
        {streamState === 'playing' && (
          <View className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-full">
            <View className="flex-row items-center gap-2">
              <Wifi size={16} color={connectionQuality === 'excellent' ? '#10b981' : connectionQuality === 'good' ? '#f59e0b' : '#ef4444'} />
              <Text className="text-white text-xs font-medium capitalize">{connectionQuality}</Text>
            </View>
          </View>
        )}

        {/* Stream State Overlays */}
        {renderStreamContent()}

        {/* Camera Info Overlay */}
        {showControls && streamState !== 'loading' && streamState !== 'error' && (
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20">
            {/* Camera Details */}
            <View className="mb-4">
              <Text className="text-white text-xl font-bold">{mockCamera.name}</Text>
              <View className="flex-row items-center gap-4 mt-2">
                <View className="flex-row items-center gap-1">
                  <View className={`w-2 h-2 rounded-full ${mockCamera.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className="text-gray-300 text-sm capitalize">{mockCamera.status}</Text>
                </View>
                <Text className="text-gray-300 text-sm">•</Text>
                <Text className="text-gray-300 text-sm">{mockCamera.location}</Text>
              </View>
              
              {/* Stream Stats */}
              {streamState === 'playing' && (
                <View className="flex-row items-center gap-4 mt-2">
                  <Text className="text-gray-400 text-xs">{mockCamera.protocol}</Text>
                  <Text className="text-gray-400 text-xs">•</Text>
                  <Text className="text-gray-400 text-xs">{bitrate}</Text>
                  <Text className="text-gray-400 text-xs">•</Text>
                  <Text className="text-gray-400 text-xs">{fps} FPS</Text>
                </View>
              )}
            </View>

            {/* Control Buttons */}
            <View className="flex-row items-center justify-between">
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/20 p-3 rounded-full"
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>

              {/* Center Controls */}
              <View className="flex-row items-center gap-4">
                {/* Play/Pause */}
                {(streamState === 'playing' || streamState === 'paused') && (
                  <TouchableOpacity
                    onPress={handlePlayPause}
                    className="bg-primary p-4 rounded-full"
                  >
                    {streamState === 'playing' ? (
                      <Pause size={28} color="white" fill="white" />
                    ) : (
                      <Play size={28} color="white" fill="white" />
                    )}
                  </TouchableOpacity>
                )}

                {/* Reconnect Button (shown on error) */}
                {(streamState as StreamState) === 'error' && (
                  <TouchableOpacity
                    onPress={handleReconnect}
                    className="bg-primary p-4 rounded-full"
                  >
                    <RotateCw size={28} color="white" />
                  </TouchableOpacity>
                )}

              </View>

              {/* Right Controls */}
              <View className="flex-row items-center gap-2">
                {/* Snapshot Button */}
                {streamState === 'playing' && (
                  <TouchableOpacity
                    onPress={handleSnapshot}
                    className="bg-white/20 p-3 rounded-full"
                  >
                    <Camera size={24} color="white" />
                  </TouchableOpacity>
                )}

                {/* Fullscreen Button */}
                <TouchableOpacity
                  onPress={handleFullscreen}
                  className="bg-white/20 p-3 rounded-full"
                >
                  <Maximize size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Troubleshooting Tips (shown on error) */}
      {streamState === 'error' && (
        <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <View className="flex-row items-start gap-3">
            <AlertCircle size={20} color="#f59e0b" />
            <View className="flex-1">
              <Text className="text-foreground font-semibold mb-1">Troubleshooting Tips:</Text>
              <Text className="text-muted-foreground text-xs">
                • Verify camera is powered on{'\n'}
                • Check network connectivity{'\n'}
                • Ensure correct IP address and port{'\n'}
                • Verify camera credentials
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}