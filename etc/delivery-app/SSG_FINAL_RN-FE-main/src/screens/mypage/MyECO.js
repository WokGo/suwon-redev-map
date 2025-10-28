import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import Background from '../../components/Background';
import Logo from '../../components/Logo';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { useNavigation } from '@react-navigation/native';

export default function MyECO() {
  const navigation = useNavigation();
  const [mileageInfo, setMileageInfo] = useState({
    mileageCount: 0,  // 마일리지 적립 횟수
    donationCount: 0, // 기부 횟수
    ecoMileage: 0,    // 에코 마일리지
    coupons: []       // 보유 쿠폰 리스트
  });

  useEffect(() => {
    // API 호출을 통해 마일리지 정보 가져오기
    // 예: fetchMileageInfo().then(data => setMileageInfo(data));
    // 임시 데이터로 상태 설정
    setMileageInfo({
      mileageCount: 10,
      donationCount: 5,
      ecoMileage: 5000,
      coupons: ['2000원 배달 할인 쿠폰', '1000원 배달 할인 쿠폰']
    });
  }, []);

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('Dashboard')} />
      <Logo />
      <Header>My ECO</Header>
      <Card containerStyle={styles.cardStyle}>
        <Card.Title>마일리지 정보</Card.Title>
        <Card.Divider />
        <Text>마일리지 적립 횟수: {mileageInfo.mileageCount}</Text>
        <Text>기부 횟수: {mileageInfo.donationCount}</Text>
        <Text>에코 마일리지: {mileageInfo.ecoMileage}</Text>
      </Card>
      {mileageInfo.coupons.length > 0 && (
        <Card containerStyle={styles.cardStyle}>
          <Card.Title>보유 쿠폰</Card.Title>
          <Card.Divider />
          {mileageInfo.coupons.map((coupon, index) => (
            <Text key={index}>{coupon}</Text>
          ))}
        </Card>
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  cardStyle: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
  },
});