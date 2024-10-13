import { SendOpcode } from '../../opcodes';
import { ByteBufOutPacket } from './ByteBufOutPacket';
import { Buffer } from 'buffer';

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
