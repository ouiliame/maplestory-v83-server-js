import { MapleAESOFB } from './MapleAESOFB';
import { PacketDecoder } from './PacketDecoder';
import { Buffer } from 'buffer';

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
    // @ts-ignore
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