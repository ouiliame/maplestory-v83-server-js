import { MapleAESOFB } from './MapleAESOFB';
import { Short } from '../numbers';
import { Buffer } from 'buffer';

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