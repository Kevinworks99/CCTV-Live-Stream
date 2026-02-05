import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Alert, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Share2, X, Calendar, Camera, MapPin, Clock } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2; // 2 columns with padding

type Snapshot = {
  id: string;
  cameraName: string;
  location: string;
  timestamp: string;
  imageUrl: string;
  date: Date;
};

// Mock snapshot data with demo images
const mockSnapshots: Snapshot[] = [
  {
    id: '1',
    cameraName: 'Front Entrance',
    location: 'Main Gate',
    timestamp: '2024-01-20 14:23:45',
    imageUrl: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=900',
    date: new Date('2024-01-20T14:23:45'),
  },
  {
    id: '2',
    cameraName: 'Parking Lot',
    location: 'Building A',
    timestamp: '2024-01-20 13:15:22',
    imageUrl: 'https://images.unsplash.com/photo-1675351085230-ab39b2289ff4?w=900',
    date: new Date('2024-01-20T13:15:22'),
  },
  {
    id: '3',
    cameraName: 'Warehouse',
    location: 'Storage Area',
    timestamp: '2024-01-20 12:45:10',
    imageUrl: 'https://images.unsplash.com/photo-1629216509258-4dbd7880e605?w=900',
    date: new Date('2024-01-20T12:45:10'),
  },
  {
    id: '4',
    cameraName: 'Front Entrance',
    location: 'Main Gate',
    timestamp: '2024-01-20 11:30:05',
    imageUrl: 'https://images.unsplash.com/photo-1600675608140-991fcf38cc6e?w=900',
    date: new Date('2024-01-20T11:30:05'),
  },
  {
    id: '5',
    cameraName: 'Parking Lot',
    location: 'Building A',
    timestamp: '2024-01-20 10:20:33',
    imageUrl: 'https://images.unsplash.com/photo-1729179666011-38d13280b92f?w=900',
    date: new Date('2024-01-20T10:20:33'),
  },
  {
    id: '6',
    cameraName: 'Warehouse',
    location: 'Storage Area',
    timestamp: '2024-01-19 16:45:12',
    imageUrl: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=900',
    date: new Date('2024-01-19T16:45:12'),
  },
];

export default function SnapshotGalleryScreen() {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<Snapshot[]>(mockSnapshots);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeleteSnapshot = (id: string) => {
    Alert.alert(
      'Delete Snapshot',
      'Are you sure you want to delete this snapshot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSnapshots(snapshots.filter(s => s.id !== id));
            setModalVisible(false);
            Alert.alert('Success', 'Snapshot deleted successfully');
          },
        },
      ]
    );
  };

  const handleShareSnapshot = async (snapshot: Snapshot) => {
    try {
      await Share.share({
        message: `CCTV Snapshot\nCamera: ${snapshot.cameraName}\nLocation: ${snapshot.location}\nTime: ${snapshot.timestamp}`,
        title: 'Share Snapshot',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share snapshot');
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Snapshots',
      'Are you sure you want to delete all snapshots? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            setSnapshots([]);
            Alert.alert('Success', 'All snapshots deleted successfully');
          },
        },
      ]
    );
  };

  const openPreview = (snapshot: Snapshot) => {
    setSelectedSnapshot(snapshot);
    setModalVisible(true);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Group snapshots by date
  const groupedSnapshots = snapshots.reduce((groups, snapshot) => {
    const dateKey = formatDate(snapshot.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(snapshot);
    return groups;
  }, {} as Record<string, Snapshot[]>);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">Snapshot Gallery</Text>
            <Text className="text-sm text-muted-foreground">{snapshots.length} snapshots</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          {snapshots.length > 0 && (
            <TouchableOpacity onPress={handleDeleteAll}>
              <Trash2 className="text-destructive" size={22} />
            </TouchableOpacity>
          )}
          <ThemeToggle />
        </View>
      </View>

      {snapshots.length === 0 ? (
        // Empty State
        <View className="flex-1 items-center justify-center px-6">
          <Camera className="text-muted-foreground mb-4" size={64} />
          <Text className="text-2xl font-bold text-foreground text-center mb-2">
            No Snapshots Yet
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            Capture snapshots from live streams to see them here
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/home')}
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-semibold">Go to Cameras</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          {Object.entries(groupedSnapshots).map(([date, dateSnapshots]) => (
            <View key={date} className="mb-6">
              {/* Date Header */}
              <View className="flex-row items-center gap-2 mb-3 mt-4">
                <Calendar className="text-primary" size={18} />
                <Text className="text-lg font-bold text-foreground">{date}</Text>
                <View className="flex-1 h-[1px] bg-border ml-2" />
              </View>

              {/* Grid Layout */}
              <View className="flex-row flex-wrap gap-3">
                {dateSnapshots.map((snapshot) => (
                  <TouchableOpacity
                    key={snapshot.id}
                    onPress={() => openPreview(snapshot)}
                    style={{ width: imageSize }}
                    className="bg-card rounded-xl overflow-hidden border border-border"
                  >
                    {/* Snapshot Image */}
                    <Image
                      source={{ uri: snapshot.imageUrl }}
                      style={{ width: imageSize, height: imageSize }}
                      resizeMode="cover"
                    />

                    {/* Overlay Info */}
                    <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                      <View className="flex-row items-center gap-1 mb-1">
                        <Camera className="text-white" size={12} />
                        <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                          {snapshot.cameraName}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Clock className="text-white/80" size={10} />
                        <Text className="text-white/80 text-[10px]">
                          {snapshot.timestamp.split(' ')[1]}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }} className="flex-1">
          {selectedSnapshot && (
            <>
              {/* Close Button */}
              <SafeAreaView>
                <View className="flex-row items-center justify-between px-6 py-4">
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X color="#fff" size={28} />
                  </TouchableOpacity>
                  <View className="flex-row gap-4">
                    <TouchableOpacity onPress={() => handleShareSnapshot(selectedSnapshot)}>
                      <Share2 color="#fff" size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSnapshot(selectedSnapshot.id)}>
                      <Trash2 color="#ef4444" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>

              {/* Full Image */}
              <View className="flex-1 items-center justify-center px-4">
                <Image
                  source={{ uri: selectedSnapshot.imageUrl }}
                  style={{ width: width - 32, height: width - 32 }}
                  resizeMode="contain"
                />
              </View>

              {/* Info Panel */}
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }} className="px-6 py-6">
                <View className="gap-3">
                  <View className="flex-row items-center gap-3">
                    <Camera color="#3b82f6" size={20} />
                    <View className="flex-1">
                      <Text className="text-white/60 text-xs mb-1">Camera</Text>
                      <Text className="text-white font-semibold text-base">
                        {selectedSnapshot.cameraName}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <MapPin color="#3b82f6" size={20} />
                    <View className="flex-1">
                      <Text className="text-white/60 text-xs mb-1">Location</Text>
                      <Text className="text-white font-semibold text-base">
                        {selectedSnapshot.location}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <Clock color="#3b82f6" size={20} />
                    <View className="flex-1">
                      <Text className="text-white/60 text-xs mb-1">Timestamp</Text>
                      <Text className="text-white font-semibold text-base">
                        {selectedSnapshot.timestamp}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}