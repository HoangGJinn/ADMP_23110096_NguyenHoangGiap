import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image'; 
import { SafeAreaView } from 'react-native-safe-area-context';

const IntroScreen = ({ onFinish }: { onFinish: () => void }) => {
  
  useEffect(() => {
    // Khi màn hình này hiện lên, bắt đầu đếm 10s
    const timer = setTimeout(() => {
      onFinish(); // Gọi hàm báo hiệu kết thúc
    }, 10000); 

    // Nếu người dùng thoát đột ngột thì hủy đếm để tránh lỗi
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source="https://hcmute.edu.vn/Resources/Images/Logo/Logo%20HCMUTE-Corel-white%20background.jpg"
          style={styles.logo}
          contentFit="contain"
          transition={1000} 
        />
        <Text style={styles.title}>Welcome to HCMUTE</Text>
        <Text style={styles.subText}>Đang chuyển trang sau 10 giây...</Text>
      </View>
    </SafeAreaView>
  );
};

const HomeScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: '#0056b3' }]}>GIỚI THIỆU BẢN THÂN</Text>
        
        <View style={styles.infoBox}>
          {/* Avatar */}
          <Image 
            source="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            style={styles.avatar}
            contentFit="cover"
          />
          
          <View style={styles.textGroup}>
            <Text style={styles.label}>Họ và tên:</Text>
            <Text style={styles.value}>Nguyễn Hoàng Giáp</Text>
          </View>
          
          <View style={styles.textGroup}>
            <Text style={styles.label}>MSSV:</Text>
            <Text style={styles.value}>23110096</Text>
          </View>
          
          <View style={styles.textGroup}>
            <Text style={styles.label}>Lớp:</Text>
            <Text style={styles.value}>CNPM CLC02</Text>
          </View>
          
          <View style={styles.textGroup}>
            <Text style={styles.label}>Ngành:</Text>
            <Text style={styles.value}>Công nghệ thông tin</Text>
          </View>
        </View>

        {/* --- Nút quay lại Intro --- */}
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>⬅ Quay lại Intro</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

// --- App Chính ---
export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  // showIntro = true  -> Hiện IntroScreen
  // showIntro = false -> Hiện HomeScreen
  return (
    <View style={{ flex: 1 }}>
      {showIntro ? (
        <IntroScreen onFinish={() => setShowIntro(false)} />
      ) : (
        <HomeScreen onBack={() => setShowIntro(true)} />
      )}
    </View>
  );
}

// --- Style làm đẹp ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 40,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    fontStyle: 'italic',
  },
  infoBox: {
    width: '100%',
    padding: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
    marginBottom: 30, // Tạo khoảng cách với nút bấm
  },
  textGroup: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    width: 100,
    color: '#555',
  },
  value: {
    fontSize: 18,
    color: '#000',
    flex: 1,
  },
  // Style cho nút bấm mới
  button: {
    backgroundColor: '#0056b3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});