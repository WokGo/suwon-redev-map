import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'expo-camera';
import { View, StyleSheet, TouchableHighlight, Alert } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import BackButton from '../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);
  const apiUrl = API_URL;


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    setIsLoading(true);

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const uri = photo.uri;
      console.log(photo)
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      try {
        const token = await AsyncStorage.getItem('Token');
        const response = await fetch(apiUrl + '/image', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-access-token': token,
         
          },
        });
       
        if (response.ok) {
          const data = await response.json();
          console.log(data.message); // 서버에서 온 데이터 확인
          if (data.message === "성공") {
            // 성공적인 응답 처리
            Alert.alert(`성공!현재 잔액: ${data.mileage}점`);
            
            navigation.goBack();
          } else {

            Alert.alert('실패', '더 깨끗이 씻어주세요..');
            navigation.goBack();
          }
   
        } else {
          Alert.alert('오류', '이미지 전송에 실패했습니다.');
          throw new Error('이미지 전송 실패');
          
        }
      } catch (error) {
        console.error('이미지 전송 오류:', error);
        Alert.alert('오류', '이미지 전송에 실패했습니다.');
      } finally {
        setIsLoading(false); // 작업 종료 후 로딩 상태 해제
      }
     
     
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <View><Text>카메라 접근 권한이 없습니다.</Text></View>;
  }

  return (
    <View style={styles.container}>
    <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.back}>
    <BackButton goBack={navigation.goBack} />
      <View style={styles.buttonContainer}>
        <TouchableHighlight style={styles.captureButton} onPress={takePicture}>
          <View />
        </TouchableHighlight>
      </View>
    </Camera>
    <Spinner
      visible={isLoading}
      textContent={'AI 분석 중...'}
      animation='slide'
      color={'white'}
      textStyle={{ color: 'white'}}
      size="large"
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    width: '100%',
  },
  captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#ffffff',
      padding: 10,
    margin: 20,
  },
});
