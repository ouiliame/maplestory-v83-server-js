import { MapleAESOFB } from './MapleAESOFB';
import { MapleCustomEncryption } from './MapleCustomEncryption';
import { Int } from '../numbers';
import { Buffer } from 'buffer';

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
    // @ts-ignore
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
