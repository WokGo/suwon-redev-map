export function passwordValidator(password) {
  if (!password) return "비밀번호를 입력해주세요"
  if (password.length < 5) return '비밀번호는 최소 다섯 글자 이상으로 해주세요.'
  return ''
}
