import React from 'react';
import { View, StyleSheet } from 'react-native';
import Postcode from '@actbase/react-daum-postcode';
import BackButton from '../components/BackButton';

export default function AddressSearchScreen({ navigation }) {
  const handleAddressSelection = (data) => {
    // data 객체에서 address와 zonecode 추출
    const { address } = data;
  
    // 선택된 주소와 우편번호를 회원가입 페이지로 전달하고 이동
    navigation.navigate('RegisterScreen', { selectedAddress: address });
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <BackButton goBack={() => navigation.navigate('RegisterScreen')} />
      </View>
      <View style={styles.postcodeContainer}>
        <Postcode
          style={styles.postcode}
          jsOptions={{ animation: true }}
          onSelected={(data) => handleAddressSelection(data)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1,
  },
  postcodeContainer: {
    marginTop: 150,
    width: '100%',
    flex: 1,
  },
  postcode: {
    width: '100%',
    height: '100%',
  },
});