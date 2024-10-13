import { SendOpcode } from '../../opcodes';
import { Buffer } from 'buffer';

export class ByteBufOutPacket {
  private byteBuf: Buffer;

  constructor();
  constructor(op: SendOpcode);
  constructor(op: SendOpcode, initialCapacity: number);
  constructor(op?: SendOpcode, initialCapacity?: number) {
    if (!op) {
      this.byteBuf = Buffer.alloc(0);
    } else {
      this.byteBuf = Buffer.alloc(initialCapacity || 2);
      this.byteBuf.writeUInt16LE(op as number);
    }
  }

  getBytes(): Buffer {
    return Buffer.from(this.byteBuf);
  }

  writeByte(value: number): void {
    const newBuf = Buffer.alloc(this.byteBuf.length + 1);
    // @ts-ignore
    this.byteBuf.copy(newBuf);
    newBuf.writeUInt8(value, this.byteBuf.length);
    this.byteBuf = newBuf;
  }

  writeBytes(value: Buffer): void {
    const newBuf = Buffer.alloc(this.byteBuf.length + value.length);
    // @ts-ignore
    this.byteBuf.copy(newBuf);
    // @ts-ignore
    value.copy(newBuf, this.byteBuf.length);
    this.byteBuf = newBuf;
  }

  writeShort(value: number): void {
    const newBuf = Buffer.alloc(this.byteBuf.length + 2);
    // @ts-ignore
    this.byteBuf.copy(newBuf);
    newBuf.writeUInt16LE(value, this.byteBuf.length);
    this.byteBuf = newBuf;
  }

  writeInt(value: number): void {
    const newBuf = Buffer.alloc(this.byteBuf.length + 4);
    // @ts-ignore
    this.byteBuf.copy(newBuf);
    newBuf.writeInt32LE(value, this.byteBuf.length);
    this.byteBuf = newBuf;
  }

  writeLong(value: bigint): void {
    const newBuf = Buffer.alloc(this.byteBuf.length + 8);
    // @ts-ignore
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
    // @ts-ignore
    this.byteBuf.copy(newBuf);
    this.byteBuf = newBuf;
  }

  equals(o: any): boolean {
    // @ts-ignore
    return o instanceof ByteBufOutPacket && this.byteBuf.equals(o.byteBuf);
  }
}
