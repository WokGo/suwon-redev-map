import React, { useEffect, useState } from 'react';
import Background from '../../components/Background';
import Logo from '../../components/Logo';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import Paragraph from '../../components/Paragraph';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

export default function ProfilePage() {
    const navigation = useNavigation();
    const apiUrl = API_URL;
    const [userInfo, setUserInfo] = useState({ name: '', email: '', address: '' });

    useEffect(() => {
        // 비동기 통신을 위한 별도의 함수 정의
        const fetchUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem('Token');
                const response = await fetch(`${apiUrl}/profile`, {
                    method: 'GET',
                    headers: {'x-access-token': token}
                });
                const data = await response.json();
                setUserInfo({
                    name: data.name,
                    email: data.email,
                    address: data.address
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                // 오류 처리 (예: 상태 업데이트 또는 사용자에게 메시지 표시)
            }
        };

        fetchUserInfo();
    }, []); // 빈 의존성 배열로 컴포넌트가 마운트될 때만 실행됨


    return (
        <Background>
            <BackButton goBack={() => navigation.navigate('Dashboard')} />
            <Logo />
            <Header>회원 정보</Header>
            <Paragraph>이름: {userInfo.name}</Paragraph>
            <Paragraph>이메일: {userInfo.email}</Paragraph>
            <Paragraph>주소: {userInfo.address}</Paragraph>
        </Background>
    );
}
