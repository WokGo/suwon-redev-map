import React from 'react'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

export default function Paragraph(props) {
  return <Text style={styles.text} {...props} />
}

const styles = StyleSheet.create({
  text: {
    fontSize: 21, // 글꼴 크기 조정
    lineHeight: 24, // 줄 높이 조정
    textAlign: 'center', // 중앙 정렬
    marginBottom: 14, // 아래 여백 조정
  },
})
