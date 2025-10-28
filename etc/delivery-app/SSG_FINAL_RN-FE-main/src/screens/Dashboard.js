import React from 'react';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function Dashboard({ navigation }) {
  const apiUrl = API_URL;

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('Token');
      const response = await fetch(apiUrl + '/logout', {
        method: 'GET',
        headers: {'x-access-token': token}
      });

      if (response.status === 200) {
        await AsyncStorage.removeItem('Token');
        navigation.reset({
          index: 0,
          routes: [{ name: 'StartScreen' }]
        });
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <Background>
      <Logo />
      <Header>마일리지 적립하기</Header>
      <Paragraph>
        지구를 지켜주세요
      </Paragraph>
      <Button mode="contained" onPress={() => navigation.navigate('CameraScreen')}>
        사진 찍기
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('MyPageRoute')}>
        마이페이지
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('MileageRoute')}>
        마일리지 사용
      </Button>
      {/* <Button mode="outlined" onPress={() => navigation.navigate('Donation')}>
        마일리지 기부
      </Button> */}
      <Button
        mode="outlined"
        onPress={handleLogout}
      >
        로그아웃
      </Button>
    </Background>
  );
}
