export function emailValidator(email) {
  const re = /\S+@\S+\.\S+/
  if (!email) return "이메일을 입력해주세요"
  if (!re.test(email)) return '유효한 이메일을 입력해주세요'
  return ''
}
