/**
 * 获取字符串长度
 * @param str
 * @returns {number}
 */
export function getStringSize(str) {
  const n_str = str ? str : '';
  let size = 0;
  for (let i = 0; i < n_str.length; i++) {
    const code = n_str.charCodeAt(i);
    if (code < 0x007F) {
      size += 1;
    } else if (code < 0x07FF) {
      size += 2;
    } else if (code < 0xFFFF) {
      size += 3;
    } else {
      size += 4;
    }
  }
  return size;
}