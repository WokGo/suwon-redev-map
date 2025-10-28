import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { Paragraph } from 'react-native-paper'
import Background from '../components/Background'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { nameValidator } from '../helpers/nameValidator'
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config/api';

export default function RegisterScreen({ route }) {
  const [name, setName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });
  const [address, setAddress] = useState({ value: '', error: '' });
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params?.selectedAddress) {
      setAddress({ value: route.params.selectedAddress, error: '' });
    }
  }, [route.params]);

  const onSignUpPressed = () => {
    const nameError = nameValidator(name.value)
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    const confirmPasswordError = password.value === confirmPassword.value ? '' : '비밀번호가 일치하지 않습니다.';
    const apiUrl = API_URL;

    if (emailError || passwordError || nameError || confirmPasswordError) {
      setName({ ...name, error: nameError })
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      setConfirmPassword({ ...confirmPassword, error: confirmPasswordError })
      return;
    }
    fetch(`${apiUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        name: name.value,
        password: password.value,
        address: address.value
      })
    })
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 500) {
        throw new Error('회원가입 실패: 중복된 사용자');
      } else {
        throw new Error('서버 오류');
      }
    })
    .then(data => {
      console.log(data);
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>회원가입</Header>
      <TextInput
        label="사용자 이름"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="이메일"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="비밀번호"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <TextInput
        label="비밀번호 확인"
        returnKeyType="done"
        value={confirmPassword.value}
        onChangeText={(text) => setConfirmPassword({ value: text, error: '' })}
        error={!!confirmPassword.error}
        errorText={confirmPassword.error}
        secureTextEntry
      />
      <Button mode="outlined" onPress={() => navigation.navigate('AddressScreen')}>
        주소 입력
      </Button>

      {address.value && (
        <View style={styles.addressContainer}>
          <View style={styles.addressBox}>
            <Text>{address.value}</Text>
          </View>
        </View>
      )}
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
      >
        회원가입
      </Button>
      <View style={styles.row}>
        <Paragraph>계정이 이미 있나요?</Paragraph>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Paragraph style={styles.link}>로그인</Paragraph>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    marginLeft: 5,
    color: theme.colors.primary,
  },
  addressContainer: {
    width: '100%',
    marginVertical: 12,
  },
  addressLabelContainer: {
    position: 'absolute',
    top: -14,
    left: 10,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  addressLabel: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    padding: 10,
    fontSize: 13,
  },
  addressBox: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 5,
    backgroundColor: theme.colors.surface,
    width: '100%',
    minHeight: 40,
    justifyContent: 'center',
  },
})
