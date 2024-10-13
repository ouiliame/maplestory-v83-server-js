import { Short, Int } from '../numbers';
import * as crypto from 'crypto';
import { Buffer } from 'buffer';


export class MapleAESOFB {

  public getIv(): Buffer {
    return this.iv;
  }

  private static readonly skey = Buffer.from([
    0x13, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x06, 0x00, 0x00, 0x00, 0xB4, 0x00, 0x00, 0x00,
    0x1B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
    0x33, 0x00, 0x00, 0x00, 0x52, 0x00, 0x00, 0x00
  ]);

  private static readonly funnyBytes = Buffer.from([
    0xEC, 0x3F, 0x77, 0xA4, 0x45, 0xD0, 0x71, 0xBF, 0xB7, 0x98, 0x20, 0xFC, 0x4B, 0xE9, 0xB3, 0xE1,
    0x5C, 0x22, 0xF7, 0x0C, 0x44, 0x1B, 0x81, 0xBD, 0x63, 0x8D, 0xD4, 0xC3, 0xF2, 0x10, 0x19, 0xE0,
    0xFB, 0xA1, 0x6E, 0x66, 0xEA, 0xAE, 0xD6, 0xCE, 0x06, 0x18, 0x4E, 0xEB, 0x78, 0x95, 0xDB, 0xBA,
    0xB6, 0x42, 0x7A, 0x2A, 0x83, 0x0B, 0x54, 0x67, 0x6D, 0xE8, 0x65, 0xE7, 0x2F, 0x07, 0xF3, 0xAA,
    0x27, 0x7B, 0x85, 0xB0, 0x26, 0xFD, 0x8B, 0xA9, 0xFA, 0xBE, 0xA8, 0xD7, 0xCB, 0xCC, 0x92, 0xDA,
    0xF9, 0x93, 0x60, 0x2D, 0xDD, 0xD2, 0xA2, 0x9B, 0x39, 0x5F, 0x82, 0x21, 0x4C, 0x69, 0xF8, 0x31,
    0x87, 0xEE, 0x8E, 0xAD, 0x8C, 0x6A, 0xBC, 0xB5, 0x6B, 0x59, 0x13, 0xF1, 0x04, 0x00, 0xF6, 0x5A,
    0x35, 0x79, 0x48, 0x8F, 0x15, 0xCD, 0x97, 0x57, 0x12, 0x3E, 0x37, 0xFF, 0x9D, 0x4F, 0x51, 0xF5,
    0xA3, 0x70, 0xBB, 0x14, 0x75, 0xC2, 0xB8, 0x72, 0xC0, 0xED, 0x7D, 0x68, 0xC9, 0x2E, 0x0D, 0x62,
    0x46, 0x17, 0x11, 0x4D, 0x6C, 0xC4, 0x7E, 0x53, 0xC1, 0x25, 0xC7, 0x9A, 0x1C, 0x88, 0x58, 0x2C,
    0x89, 0xDC, 0x02, 0x64, 0x40, 0x01, 0x5D, 0x38, 0xA5, 0xE2, 0xAF, 0x55, 0xD5, 0xEF, 0x1A, 0x7C,
    0xA7, 0x5B, 0xA6, 0x6F, 0x86, 0x9F, 0x73, 0xE6, 0x0A, 0xDE, 0x2B, 0x99, 0x4A, 0x47, 0x9C, 0xDF,
    0x09, 0x76, 0x9E, 0x30, 0x0E, 0xE4, 0xB2, 0x94, 0xA0, 0x3B, 0x34, 0x1D, 0x28, 0x0F, 0x36, 0xE3,
    0x23, 0xB4, 0x03, 0xD8, 0x90, 0xC8, 0x3C, 0xFE, 0x5E, 0x32, 0x24, 0x50, 0x1F, 0x3A, 0x43, 0x8A,
    0x96, 0x41, 0x74, 0xAC, 0x52, 0x33, 0xF0, 0xD9, 0x29, 0x80, 0xB1, 0x16, 0xD3, 0xAB, 0x91, 0xB9,
    0x84, 0x7F, 0x61, 0x1E, 0xCF, 0xC5, 0xD1, 0x56, 0x3D, 0xCA, 0xF4, 0x05, 0xC6, 0xE5, 0x08, 0x49
  ]);

  private mapleVersion: Short;
  private cipher: crypto.Cipher;
  private iv: Buffer;

  constructor(iv: Buffer, mapleVersion: Short) {
    // @ts-ignore
    this.cipher = crypto.createCipheriv('aes-256-ecb', MapleAESOFB.skey, null);
    this.iv = Buffer.from(iv);
    this.mapleVersion = mapleVersion.swapBytes();
  }

  private static multiplyBytes(input: Buffer, count: number, mul: number): Buffer {
    const size = count * mul;
    const ret = Buffer.alloc(size);
    for (let x = 0; x < size; x++) {
      ret[x] = input[x % count];
    }
    return ret;
  }

  crypt(data: Buffer): Buffer {
    let remaining = data.length;
    let llength = 0x5B0;
    let start = 0;
    while (remaining > 0) {
      const myIv = MapleAESOFB.multiplyBytes(this.iv, 4, 4);
      if (remaining < llength) {
        llength = remaining;
      }
      for (let x = start; x < (start + llength); x++) {
        if ((x - start) % myIv.length === 0) {
          // @ts-ignore
          const newIv = this.cipher.update(myIv);
          // @ts-ignore
          newIv.copy(myIv);
        }
        data[x] ^= myIv[(x - start) % myIv.length];
      }
      start += llength;
      remaining -= llength;
      llength = 0x5B4;
    }
    this.updateIv();
    return data;
  }

  private updateIv(): void {
    this.iv = MapleAESOFB.getNewIv(this.iv);
  }

  /*
Sending packet: 00 00 04 00 00 00 00 00
maplestory-1  | Entering getPacketHeader with length: 8
maplestory-1  | Initial iiv: 22
maplestory-1  | iiv after OR operation: 7822
maplestory-1  | iiv after XOR with mapleVersion: ffffd4dd
maplestory-1  | Calculated mlength: 800
maplestory-1  | xoredIv: ffffdcdd
maplestory-1  | Returning packet header: D4 DD DC DD


Entering getPacketHeader with length: 8
Initial iiv: 81
iiv after OR operation: 7881
iiv after XOR with mapleVersion: -2b82
Calculated mlength: 800
xoredIv: -2382
Returning packet header: d4 7e dc 7e
Encoded header: d4 7e dc 7e
Applying custom encryption...
After custom encryption: f55af53f561a26f0
Applying send cipher...
After send cipher: 9a9536ff9f5b511f
Final encoded packet: d47edc7e9a9536ff9f5b511f
Exiting encode method
Sending encoded packet: d47edc7e9a9536ff9f5b511f
Writing packet: d47edc7e9a9536ff9f5b511f
Sending packet (encrypted): bbb11fbe53d44110d10f7828
  */
  getPacketHeader(length: number): Buffer {
    // turn it into an Int
    const lengthInt = new Int(length);
    console.log(`Entering getPacketHeader with length: ${length}`);

    let iiv = this.iv[3] & 0xFF;
    console.log(`Initial iiv: ${iiv.toString(16).padStart(2, '0')}`);

    iiv |= (this.iv[2] << 8) & 0xFF00;
    console.log(`iiv after OR operation: ${iiv.toString(16).padStart(4, '0')}`);

    iiv ^= this.mapleVersion.getValue();
    console.log(`iiv after XOR with mapleVersion: ${(iiv >>> 0).toString(16).padStart(8, '0')}`);

    const mlength = ((length << 8) & 0xFF00) | (length >>> 8);
    console.log(`Calculated mlength: ${mlength.toString(16).padStart(4, '0')}`);

    const xoredIv = iiv ^ mlength;
    console.log(`xoredIv: ${(xoredIv >>> 0).toString(16).padStart(8, '0')}`);

    const ret = Buffer.alloc(4);
    ret[0] = (iiv >>> 8) & 0xFF;
    ret[1] = iiv & 0xFF;
    ret[2] = (xoredIv >>> 8) & 0xFF;
    ret[3] = xoredIv & 0xFF;

    console.log(`Returning packet header: ${ret.toString('hex')}`);
    return ret;
  }

  static getPacketLength(packetHeader: number): number {
    let packetLength = ((packetHeader >>> 16) ^ (packetHeader & 0xFFFF));
    packetLength = ((packetLength << 8) & 0xFF00) | ((packetLength >>> 8) & 0xFF);
    return packetLength;
  }

  /*
  OUR RESULT:
  Entering checkPacket method
packet: 29ec
iv: 46727aec
mapleVersion: 83
First check: 83 == 0
Second check: 0 == 83
Result: false

DESIRED RESULT:
maplestory-1  | Entering checkPacket method
maplestory-1  | packet: 29 E5
maplestory-1  | iv: 46 72 7A E5
maplestory-1  | mapleVersion: 21248
maplestory-1  | First check: 83 == 83
maplestory-1  | Second check: 0 == 0
maplestory-1  | Result: tru
   */
  checkPacket(packet: Buffer): boolean {
    console.log("Entering checkPacket method");
    console.log("packet: " + packet.toString('hex'));
    console.log("iv: " + this.iv.toString('hex'));
    console.log("mapleVersion: " + this.mapleVersion.getValue());

    const firstCheck = (packet[0] ^ this.iv[2]) & 0xFF;
    const secondCheck = (this.mapleVersion.getValue() >> 8) & 0xFF;
    console.log("First check: " + firstCheck + " == " + secondCheck);

    const thirdCheck = (packet[1] ^ this.iv[3]) & 0xFF;
    const fourthCheck = this.mapleVersion.getValue() & 0xFF;
    console.log("Second check: " + thirdCheck + " == " + fourthCheck);

    const result = (firstCheck == secondCheck) && (thirdCheck == fourthCheck);
    console.log("Result: " + result);

    console.log("Exiting checkPacket method");
    return result;
  }

  /*
  maplestory-1  | Starting packet decoding process...
maplestory-1  | Packet header: 29eca3ec
maplestory-1  | Entering isValidHeader method with packetHeader: 29eca3ec
maplestory-1  | Created packetHeaderBuf with length: 2
maplestory-1  | Set packetHeaderBuf[0] to: 29
maplestory-1  | Set packetHeaderBuf[1] to: EC
maplestory-1  | Entering checkPacket method
maplestory-1  | packet: 29 EC
maplestory-1  | iv: 46 72 7A EC
maplestory-1  | mapleVersion: 21248
maplestory-1  | First check: 83 == 83
maplestory-1  | Second check: 0 == 0
maplestory-1  | Result: true
maplestory-1  | Exiting checkPacket method
maplestory-1  | Result of checkPacket: true
maplestory-1  | Exiting isValidHeader method
maplestory-1  | Packet header is valid
maplestory-1  | Decoded packet length: 138
*/
  isValidHeader(packetHeader: Int): boolean {
    console.log("Entering isValidHeader method with packetHeader: " + packetHeader.getValue().toString(16).padStart(8, '0'));

    const packetHeaderBuf = Buffer.alloc(2);
    console.log("Created packetHeaderBuf with length: " + packetHeaderBuf.length);

    packetHeaderBuf[0] = packetHeader.getValue() & 0xFF;
    console.log("Set packetHeaderBuf[0] to: " + packetHeaderBuf[0].toString(16).padStart(2, '0').toUpperCase());

    packetHeaderBuf[1] = (packetHeader.getValue() >> 8) & 0xFF;
    console.log("Set packetHeaderBuf[1] to: " + packetHeaderBuf[1].toString(16).padStart(2, '0').toUpperCase());

    const result = this.checkPacket(packetHeaderBuf);
    console.log("Result of checkPacket: " + result);

    console.log("Exiting isValidHeader method");
    return result;
  }

  static getNewIv(oldIv: Buffer): Buffer {
    const in_ = Buffer.from([0xf2, 0x53, 0x50, 0xc6]);
    for (let x = 0; x < 4; x++) {
      MapleAESOFB.funnyShit(oldIv[x], in_);
    }
    return in_;
  }

  toString(): string {
    return `IV: ${this.iv.toString('hex')}`;
  }

  private static funnyShit(inputByte: number, in_: Buffer): Buffer {
    let elina = in_[1];
    const anna = inputByte;
    let moritz = MapleAESOFB.funnyBytes[elina & 0xFF];
    moritz -= inputByte;
    in_[0] += moritz;
    moritz = in_[2];
    moritz ^= MapleAESOFB.funnyBytes[anna & 0xFF];
    elina -= moritz & 0xFF;
    in_[1] = elina;
    elina = in_[3];
    moritz = elina;
    elina -= in_[0] & 0xFF;
    moritz = MapleAESOFB.funnyBytes[moritz & 0xFF];
    moritz += inputByte;
    moritz ^= in_[2];
    in_[2] = moritz;
    elina += MapleAESOFB.funnyBytes[anna & 0xFF] & 0xFF;
    in_[3] = elina;
    let merry = in_[0] & 0xFF;
    merry |= (in_[1] << 8) & 0xFF00;
    merry |= (in_[2] << 16) & 0xFF0000;
    merry |= (in_[3] << 24) & 0xFF000000;
    let ret_value = merry >>> 0x1d;
    merry = merry << 3;
    ret_value = ret_value | merry;
    in_[0] = ret_value & 0xFF;
    in_[1] = (ret_value >> 8) & 0xFF;
    in_[2] = (ret_value >> 16) & 0xFF;
    in_[3] = (ret_value >> 24) & 0xFF;
    return in_;
  }
}