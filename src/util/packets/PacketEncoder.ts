import { MapleAESOFB } from './MapleAESOFB';
import { MapleCustomEncryption } from './MapleCustomEncryption';
import { Buffer } from 'buffer';

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
