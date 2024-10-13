import { SendOpcode } from '../opcodes';
import { Short, Int } from './numbers';
import * as crypto from 'crypto';

export class ByteBufOutPacket  {
  private byteBuf: Buffer;

  constructor();
  constructor(op: SendOpcode);
  constructor(op: SendOpcode, initialCapacity: number);
  constructor(op?: SendOpcode, initialCapacity?: number) {
      if (!op) {
          this.byteBuf = Buffer.alloc(0);
      } else {
          this.byteBuf = Buffer.alloc(initialCapacity || 2);
          this.byteBuf.writeUInt16LE(op.getValue());
      }
  }

  getBytes(): Buffer {
      return Buffer.from(this.byteBuf);
  }

  writeByte(value: number): void {
      const newBuf = Buffer.alloc(this.byteBuf.length + 1);
      this.byteBuf.copy(newBuf);
      newBuf.writeUInt8(value, this.byteBuf.length);
      this.byteBuf = newBuf;
  }

  writeBytes(value: Buffer): void {
      const newBuf = Buffer.alloc(this.byteBuf.length + value.length);
      this.byteBuf.copy(newBuf);
      value.copy(newBuf, this.byteBuf.length);
      this.byteBuf = newBuf;
  }

  writeShort(value: number): void {
      const newBuf = Buffer.alloc(this.byteBuf.length + 2);
      this.byteBuf.copy(newBuf);
      newBuf.writeUInt16LE(value, this.byteBuf.length);
      this.byteBuf = newBuf;
  }

  writeInt(value: number): void {
      const newBuf = Buffer.alloc(this.byteBuf.length + 4);
      this.byteBuf.copy(newBuf);
      newBuf.writeInt32LE(value, this.byteBuf.length);
      this.byteBuf = newBuf;
  }

  writeLong(value: bigint): void {
      const newBuf = Buffer.alloc(this.byteBuf.length + 8);
      this.byteBuf.copy(newBuf);
      newBuf.writeBigInt64LE(value, this.byteBuf.length);
      this.byteBuf = newBuf;
  }

  writeBool(value: boolean): void {
      this.writeByte(value ? 1 : 0);
  }

  writeString(value: string): void {
      const strBuf = Buffer.from(value, 'utf-8');
      this.writeShort(strBuf.length);
      this.writeBytes(strBuf);
  }

  writeFixedString(value: string): void {
      const strBuf = Buffer.from(value, 'utf-8');
      this.writeBytes(strBuf);
  }

  writePos(value: { x: number, y: number }): void {
      this.writeShort(value.x);
      this.writeShort(value.y);
  }

  skip(numberOfBytes: number): void {
      const newBuf = Buffer.alloc(this.byteBuf.length + numberOfBytes);
      this.byteBuf.copy(newBuf);
      this.byteBuf = newBuf;
  }

  equals(o: any): boolean {
      return o instanceof ByteBufOutPacket && this.byteBuf.equals(o.byteBuf);
  }
}

export class PacketCreator {
  static getHello(version: number, sendIv: Buffer, recvIv: Buffer): Buffer {
    const packet = new ByteBufOutPacket();
    packet.writeShort(0x0E);
    packet.writeShort(version);
    packet.writeShort(1);
    packet.writeByte(49);
    packet.writeBytes(recvIv);
    packet.writeBytes(sendIv);
    packet.writeByte(8);
    return packet.getBytes()
  }

  static getLoginFailed(reason: number): Buffer {
    const packet = new ByteBufOutPacket();
    packet.writeShort(SendOpcode.LOGIN_STATUS);
    packet.writeByte(reason);
    packet.writeByte(0);
    packet.writeInt(0);
    return packet.getBytes();
  }

  // TODO: Add client parameter
  static getAuthSuccess(): Buffer {
    const packet = new ByteBufOutPacket();
    packet.writeShort(SendOpcode.LOGIN_STATUS);
    packet.writeInt(0);
    packet.writeShort(0);
    packet.writeInt(0);
    packet.writeByte(0);

    packet.writeBool(true); // isGM
    packet.writeByte(0x80); // Admin Byte
    packet.writeByte(0); // Country Code

    packet.writeString("TestAccount");
    packet.writeByte(0);

    packet.writeByte(0); // IsQuietBan
    packet.writeLong(0n); // IsQuietBanTimeStamp
    packet.writeLong(0n); // CreationTimeStamp

    packet.writeInt(1); // Remove "Select the world you want to play in"

    packet.writeByte(0); // EnablePin
    packet.writeByte(0); // EnablePIC

    return packet.getBytes();
  }

  static pinAccepted(): Buffer {
    const packet = new ByteBufOutPacket();
    packet.writeShort(SendOpcode.CHECK_PINCODE);
    packet.writeByte(0);
    return packet.getBytes();
  }
}

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
          const newIv = this.cipher.update(myIv);
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



export class ClientCiphers {
  private send: MapleAESOFB;
  private receive: MapleAESOFB;

  constructor(sendIv: Buffer, receiveIv: Buffer) {
    const version = 83;
    this.send = new MapleAESOFB(sendIv, new Short(0xFFFF - new Short(version).getValue()));
    this.receive = new MapleAESOFB(receiveIv, new Short(version));
  }

  encrypt(data: Buffer): Buffer {
    return this.send.crypt(data);
  }

  decrypt(data: Buffer): Buffer {
    return this.receive.crypt(data);
  }

  static of(sendIv: Buffer, receiveIv: Buffer): ClientCiphers {
    return new ClientCiphers(sendIv, receiveIv);
  }

  getSendCypher(): MapleAESOFB {
    return this.send;
  }

  getReceiveCypher(): MapleAESOFB {
    return this.receive;
  }
}
import { Socket } from 'net';

export class PacketProcessor {
  private handlers: Map<number, (socket: Socket, data: Buffer) => void>;

  constructor() {
    this.handlers = new Map();
  }

  registerHandler(opcode: number, handler: (socket: Socket, data: Buffer) => void) {
    this.handlers.set(opcode, handler);
  }

  processPacket(socket: Socket, opcode: number, data: Buffer) {
    const handler = this.handlers.get(opcode);
    if (handler) {
      handler(socket, data);
    } else {
      console.log(`No handler for opcode: ${opcode}`);
    }
  }
}

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

/**
 * maplestory-1  | Starting packet decoding process...
maplestory-1  | Packet header: 296ea36e
maplestory-1  | Packet header is valid
maplestory-1  | Decoded packet length: 138
maplestory-1  | Raw packet data: 27 1B 80 8F 7E 4D 8C FD 5B 2D DB 77 89 66 7A D0 12 5B 40 C8 E0 90 9C 2D 9C 72 DF D5 0E 3B 18 9F 5E 8E AD 83 51 54 AB DE 38 9D EB AC 80 0E 6C 82 B6 CF B5 DB 0E D5 15 C9 6D 1F 0C 4A EE 4F AD 63 83 69 96 1E DA F2 30 DD F4 B1 34 FA AA 69 CB 2F E2 E5 1E D4 AD 12 64 E5 75 2F D4 D7 47 43 BD 6C 40 9D 6A 1D B0 B7 3A A6 86 93 58 5A C6 A2 41 B9 EC 75 B2 22 DA C1 06 55 80 18 DA 71 9B 39 41 75 BC 6C 82 8C 6E C0 0D 48 50 0E 
maplestory-1  | Applying receive cipher...
maplestory-1  | After receive cipher: 27 8E 5F CF F9 A8 85 AA 19 47 97 D5 F3 33 4D 54 5B 05 7C 3C 94 59 5A E9 02 89 A6 2C 3C 8C 6B 8B 30 D3 DB 80 D5 FE F2 03 D7 09 FE D5 3C 41 8D 08 34 1E 52 7E 42 25 1C 2B F9 EA AE 11 6E 47 83 13 64 E8 6B E8 23 18 E5 20 D2 AE C6 C3 6A AD 60 DA 3A 4E CD B9 81 37 CB DC D3 B2 3B 6B E8 F8 BC C6 0F 0F DC FD 12 AE DD E8 6B 13 75 9F 21 97 F3 DC FA A2 B0 10 17 E6 0F 7B D7 7C 5F C7 6A 22 E7 DF 30 83 7D 77 96 BB A1 F9 1B 25 
maplestory-1  | Applying custom decryption...
maplestory-1  | Decrypted packet data: 19 00 86 00 76 65 72 28 38 33 29 2C 20 43 68 61 72 61 63 74 65 72 4E 61 6D 65 28 29 2C 20 57 6F 72 6C 64 49 44 28 2D 31 29 2C 20 43 68 49 44 28 2D 31 29 2C 20 46 69 65 6C 64 49 44 28 2D 31 29 2C 20 63 6F 6D 5F 65 72 72 6F 72 28 65 72 72 6F 72 20 63 6F 64 65 20 3A 20 2D 32 31 34 37 34 36 37 32 35 39 20 28 55 6E 73 70 65 63 69 66 69 65 64 20 65 72 72 6F 72 29 29 20 73 6F 75 72 63 65 28 28 6E 75 6C 6C 29 29 0D 0A 
maplestory-1  | Packet decoding completed
 */
export class PacketDecoder {
  private receiveCypher: MapleAESOFB;

  constructor(receiveCypher: MapleAESOFB) {
    this.receiveCypher = receiveCypher;
  }

  decode(data: Buffer): Buffer | null {
    console.log("Starting packet decoding process...");
    console.log("Raw Data: " + data.toString('hex'));

    if (data.length < 4) {
      return null;
    }

    const header = new Int(data.readInt32LE(0));
    console.log("Packet header: " + header.getValue().toString(16).padStart(8, '0'));

    if (!this.receiveCypher.isValidHeader(header)) {
      console.log("Invalid packet header detected");
      throw new Error("Attempted to decode a packet with an invalid header");
    }
    console.log("Packet header is valid");

    const packetLength = this.decodePacketLength(header);
    console.log("Decoded packet length: " + packetLength);

    if (data.length < packetLength + 4) {
      return null;
    }

    const packet = Buffer.alloc(packetLength);
    data.copy(packet, 0, 4, packetLength + 4);
    console.log("Raw packet data: " + packet.toString('hex'));

    console.log("Applying receive cipher...");
    this.receiveCypher.crypt(packet);
    console.log("After receive cipher: " + packet.toString('hex'));

    console.log("Applying custom decryption...");
    MapleCustomEncryption.decryptData(packet);
    console.log("Decrypted packet data: " + packet.toString('hex'));
    console.log("Packet decoding completed");
    return packet;
  }

  // private decodePacketLength(header: Uint8Array): number {
  //   return (((header[1] ^ header[3]) & 0xFF) << 8) | ((header[0] ^ header[2]) & 0xFF);
  // }

  private decodePacketLength(header: Int): number {
    console.log("Entering decodePacketLength with header:", header.getValue().toString(16));

    // Ensure header is treated as unsigned 32-bit integer
    const headerValue = header.getValue() >>> 0;

    // XOR upper and lower 16 bits
    let length = ((headerValue >>> 16) ^ (headerValue & 0xFFFF)) & 0xFFFF;
    console.log("After XOR operation:", length.toString(16).padStart(4, '0'));

    // Swap bytes using Int
    length = new Int(length).getValue();
    console.log("After byte swap:", length.toString(16).padStart(4, '0'));

    console.log("Exiting decodePacketLength with result:", length);
    return length;
  }
}


export class PacketEncoder {
  private sendCypher: MapleAESOFB;

  constructor(sendCypher: MapleAESOFB) {
    this.sendCypher = sendCypher;
  }

  /*

maplestory-1  | Entering encode method
maplestory-1  | Getting bytes from input packet
maplestory-1  | Packet bytes: 00 00 04 00 00 00 00 00
maplestory-1  | Getting encoded header for packet length: 8
maplestory-1  | Entering getPacketHeader with length: 8
maplestory-1  | Initial iiv: a8
maplestory-1  | iiv after OR operation: 78a8
maplestory-1  | iiv after XOR with mapleVersion: ffffd457
maplestory-1  | Calculated mlength: 800
maplestory-1  | xoredIv: ffffdc57
maplestory-1  | Returning packet header: D4 57 DC 57
maplestory-1  | Encoded header: D4 57 DC 57
maplestory-1  | Writing encoded header to output buffer
maplestory-1  | Encrypting packet data
maplestory-1  | Packet after custom encryption: F5 5A F5 3F 56 1A 26 F0
maplestory-1  | Crypting packet with sendCypher
maplestory-1  | Packet after sendCypher encryption: 50 2C 4B 3B AE FD 36 9D
maplestory-1  | Writing encrypted packet to output buffer
maplestory-1  | Exiting encode metho
  
  Entering encode method
Getting bytes from input packet
Packet bytes: 0000040000000000
Getting encoded header for packet length: 8
Entering getPacketHeader with length: 8
Initial iiv: 03
iiv after OR operation: 7803
iiv after XOR with mapleVersion: ffffd4fc
Calculated mlength: 0800
xoredIv: ffffdcfc
Returning packet header: d4fcdcfc
Encoded header: d4 fc dc fc
Encrypting packet data
Packet after custom encryption: f55af53f561a26f0
Crypting packet with sendCypher
Packet after sendCypher encryption: 01 f0 ba c1 54 d8 d7 51
Exiting encode method
  */
  encode(packet: Buffer): Buffer {
    console.log("Entering encode method");

    console.log("Getting bytes from input packet");
    const data = packet;
    console.log("Packet bytes: " + data.toString('hex'));

    console.log("Getting encoded header for packet length: " + data.length);
    const header = this.getEncodedHeader(data.length);
    console.log("Encoded header: " + header.toString('hex'));

    console.log("Encrypting packet data");
    MapleCustomEncryption.encryptData(data);
    console.log("Packet after custom encryption: " + data.toString('hex'));

    console.log("Crypting packet with sendCypher");
    this.sendCypher.crypt(data);
    console.log("Packet after sendCypher encryption: " + data.toString('hex'));

    const result = Buffer.concat([header, data]);

    console.log("Exiting encode method");
    return result;
  }

  private getEncodedHeader(length: number): Buffer {
    return this.sendCypher.getPacketHeader(length);
  }
}

export class PacketBuffer {
  private buffer: Buffer;
  private decoder: PacketDecoder;

  constructor(receiveCypher: MapleAESOFB) {
    this.buffer = Buffer.alloc(0);
    this.decoder = new PacketDecoder(receiveCypher);
  }

  hasNextPacket(): boolean {
    return this.buffer.length >= 4;
  }

  append(data: Buffer) {
    console.log("Appending data: " + data.toString('hex'));
    this.buffer = Buffer.concat([this.buffer, data]);
  }

  getNextPacket(): Buffer | null {
    const packet = this.decoder.decode(this.buffer);
    if (packet) {
      this.buffer = this.buffer.slice(packet.length + 4);
    }
    return packet;
  }
}
