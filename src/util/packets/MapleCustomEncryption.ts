import { Buffer } from 'buffer';

export class MapleCustomEncryption {
  private static rollLeft(input: number, count: number): number {
    let tmp = input & 0xFF;
    tmp = tmp << (count % 8);
    return (tmp & 0xFF) | (tmp >> 8);
  }

  private static rollRight(input: number, count: number): number {
    let tmp = input & 0xFF;
    tmp = (tmp << 8) >>> (count % 8);
    return (tmp & 0xFF) | (tmp >>> 8);
  }

  static encryptData(data: Buffer): Buffer {
    for (let j = 0; j < 6; j++) {
      let remember = 0;
      let dataLength = data.length & 0xFF;
      if (j % 2 === 0) {
        for (let i = 0; i < data.length; i++) {
          let cur = data[i];
          cur = this.rollLeft(cur, 3);
          cur = (cur + dataLength) & 0xFF;
          cur ^= remember;
          remember = cur;
          cur = this.rollRight(cur, dataLength & 0xFF);
          cur = (~cur) & 0xFF;
          cur = (cur + 0x48) & 0xFF;
          dataLength--;
          data[i] = cur;
        }
      } else {
        for (let i = data.length - 1; i >= 0; i--) {
          let cur = data[i];
          cur = this.rollLeft(cur, 4);
          cur = (cur + dataLength) & 0xFF;
          cur ^= remember;
          remember = cur;
          cur ^= 0x13;
          cur = this.rollRight(cur, 3);
          dataLength--;
          data[i] = cur;
        }
      }
    }
    return data;
  }

  static decryptData(data: Buffer): Buffer {
    for (let j = 1; j <= 6; j++) {
      let remember = 0;
      let dataLength = data.length & 0xFF;
      let nextRemember;
      if (j % 2 === 0) {
        for (let i = 0; i < data.length; i++) {
          let cur = data[i];
          cur = (cur - 0x48) & 0xFF;
          cur = (~cur) & 0xFF;
          cur = this.rollLeft(cur, dataLength & 0xFF);
          nextRemember = cur;
          cur ^= remember;
          remember = nextRemember;
          cur = (cur - dataLength) & 0xFF;
          cur = this.rollRight(cur, 3);
          data[i] = cur;
          dataLength--;
        }
      } else {
        for (let i = data.length - 1; i >= 0; i--) {
          let cur = data[i];
          cur = this.rollLeft(cur, 3);
          cur ^= 0x13;
          nextRemember = cur;
          cur ^= remember;
          remember = nextRemember;
          cur = (cur - dataLength) & 0xFF;
          cur = this.rollRight(cur, 4);
          data[i] = cur;
          dataLength--;
        }
      }
    }
    return data;
  }
}