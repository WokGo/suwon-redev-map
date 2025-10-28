import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from 'react-native-elements';
import Background from '../../components/Background';
import Logo from '../../components/Logo';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const Donation = ({ navigation }) => {
  const [currentMileage, setCurrentMileage] = useState();
  const [coupons, setCoupons] = useState([]);
  const apiUrl = API_URL;
  
  const handleExchange = async (coupon) => {
    try {
      const token = await AsyncStorage.getItem('Token');
      const response = await fetch(`${apiUrl}/donation_use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({ coupon_id: coupon.id }), // 해당 쿠폰의 ID 전송
      });
  
      if (response.status === 200) {
        const newMileageResponse = await fetch(`${apiUrl}/get_user_mileage`, {
          headers: { 'x-access-token': token }
        });
  
        if (newMileageResponse.status === 200) {
          const data = await newMileageResponse.json();
          setCurrentMileage(data.mileage);
          alert(`기부 감사용! 현재 잔액: ${data.mileage}점`);
        } else if (newMileageResponse.status === 500) {
          throw new Error('마일리지 업데이트 중 에러가 발생했습니다');
        } else {
          throw new Error('서버 오류');
        }
      } else if (response.status === 500) {
        throw new Error('요청 중 에러가 발생했습니다');
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
        console.error('쿠폰 사용 중 오류 발생:', error);
        alert(`쿠폰 사용 중 오류 발생`);
    }
  };
  
  
  useEffect(() => {
    fetch(`${apiUrl}/donation_list`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 500) {
          throw new Error('요청중 에러가 발생');
        } else {
          throw new Error('서버 오류');
        }
      })
      .then(data => {
        if (Array.isArray(data.coupon)) {
          setCoupons(data.coupon);
        } else {
          setCoupons([]);
        }
      })
      .catch(error => {
        console.error('Error fetching coupons:', error);
        setCoupons([]);
      });
  }, []);  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('Token');
        const response = await fetch(`${apiUrl}/get_user_mileage`, {
          headers: { 'x-access-token': token }
        });
  
        if (response.status === 200) {
          const data = await response.json();
          setCurrentMileage(data.mileage);
        } else if (response.status === 500) {
          throw new Error('요청 중 에러가 발생했습니다');
        } else {
          throw new Error('서버 오류');
        }
      } catch (error) {
        console.error('사용자 마일리지를 가져오는 중 오류 발생:', error);
        setCurrentMileage(0);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('Dashboard')} />
      <Logo />
      <Header>쿠폰 사용하기</Header>
      <Text style={styles.mileageText}>현재 마일리지: {currentMileage}점</Text>

      <ScrollView style={styles.scrollView}>
      {coupons.length > 0 ? (
        coupons.map((coupon) => (
          <Card key={coupon.id} containerStyle={styles.cardStyle}>
            <Card.Title>{coupon.name}</Card.Title>
            <Card.Divider />
            <Text style={styles.couponText}>
              필요 마일리지: {coupon.usepoint}
            </Text>
            <TouchableOpacity
              onPress={() => handleExchange(coupon)}
              disabled={currentMileage < coupon.usepoint}
              style={currentMileage >= coupon.usepoint ? styles.exchangeButton : styles.disabledButton}
            >
              <Text style={styles.exchangeButtonText}>교환</Text>
            </TouchableOpacity>
          </Card>
        ))
      ) : (
        <Text style={styles.noCouponsText}>사용 가능한 쿠폰이 없습니다.</Text>
      )}
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
  },
  cardStyle: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  mileageText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  couponText: {
    fontSize: 15,
    marginBottom: 10,
  },
  exchangeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  exchangeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noCouponsText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Donation;
