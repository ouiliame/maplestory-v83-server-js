import * as net from 'net';
import { RecvOpcode } from './opcodes';
import { Buffer } from 'buffer';
import { PacketProcessor, PacketBuffer, ClientCiphers, MapleAESOFB, PacketCreator, PacketDecoder, PacketEncoder } from './util/packets';
import { Short, Int } from './util/numbers';

export namespace ServerConstants {
  export const VERSION = 83;
  export const IDLE_TIME_SECONDS = 30;
}


class LoginServer {
  private server: net.Server;
  private packetProcessor: PacketProcessor;
  private packetBuffer: PacketBuffer;
  private packetEncoder: PacketEncoder;
  private receiveCypher: MapleAESOFB;
  private sendCypher: MapleAESOFB;

  constructor(port: number) {
    const receiveIv = this.generateInitializationVector('receive');
    const sendIv = this.generateInitializationVector('send');
    this.packetProcessor = new PacketProcessor();
    this.sendCypher = new MapleAESOFB(sendIv, new Short(0xFFFF - 83));
    this.receiveCypher = new MapleAESOFB(receiveIv, new Short(83));
    this.packetEncoder = new PacketEncoder(this.sendCypher);
    this.packetBuffer = new PacketBuffer(this.receiveCypher);
    this.server = net.createServer((socket) => this.handleConnection(socket));

    this.server.listen(port, '0.0.0.0', () => {
      console.log(`Login server listening on 0.0.0.0:${port}`);
    });

    this.registerPacketHandlers();
  }

  private handleConnection(socket: net.Socket) {
    console.log(`Client connected from ${socket.remoteAddress}`);

    const clientSessionId = Date.now();
    const sendIv = this.sendCypher.getIv();
    const recvIv = this.receiveCypher.getIv();

    console.log(sendIv.toString('hex'));
    console.log(recvIv.toString('hex'));

    this.sendHelloPacket(socket, sendIv, recvIv);
    this.setupHandlers(socket, sendIv, recvIv, clientSessionId);
  }

  private generateInitializationVector(type: 'send' | 'receive'): Buffer {
    const iv = Buffer.alloc(4);
    if (type === 'send') {
      iv[0] = 82; iv[1] = 48; iv[2] = 120;
    } else {
      iv[0] = 70; iv[1] = 114; iv[2] = 122;
    }
    iv[3] = Math.floor(Math.random() * 255);
    return iv;
  }

  public sendPacket(socket: net.Socket, packet: Buffer) {
    console.log(`Sending packet: ${packet.toString('hex')}`);
    const encodedPacket = this.packetEncoder.encode(packet);
    console.log(`Sending encoded packet: ${encodedPacket.toString('hex')}`);
    socket.write(encodedPacket);
  }

  // unencrypted
  private sendHelloPacket(socket: net.Socket, sendIv: Buffer, recvIv: Buffer) {
    const packet = PacketCreator.getHello(83, sendIv, recvIv);
    console.log(`Sending hello packet: ${packet.toString('hex')}`);
    socket.write(packet);
  }

  private setupHandlers(socket: net.Socket, sendIv: Buffer, recvIv: Buffer, clientSessionId: number) {
    const ciphers = new ClientCiphers(sendIv, recvIv);
    let idleTimer = this.startIdleTimer(socket);

    const originalWrite = socket.write;
    // socket.write = (data: Buffer | string) => {
    //   const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    //   console.log(`Writing packet: ${buffer.toString('hex')}`);
    //   const encoded = ciphers.encrypt(buffer);
    //   console.log(`Sending packet (encrypted): ${encoded.toString('hex')}`);
    //   return originalWrite.call(socket, encoded);
    // };

    socket.on('data', (data: Buffer) => {
      clearTimeout(idleTimer);
      idleTimer = this.startIdleTimer(socket);
      console.log('Received data:', data.toString('hex'));
      this.packetBuffer.append(data);

      while (this.packetBuffer.hasNextPacket()) {
        const packet = this.packetBuffer.getNextPacket();
        console.log("packet: " + packet?.toString('hex'));
        if (packet) {
          const opcode = packet.readInt16LE(0);
          console.log(`Received opcode: ${opcode}`);
          this.packetProcessor.processPacket(socket, opcode, packet.subarray(2));
        }
      }
    });

    socket.on('close', () => {
      console.log(`Client disconnected: ${clientSessionId}`);
      clearTimeout(idleTimer);
    });
  }

  private startIdleTimer(socket: net.Socket): NodeJS.Timeout {
    return setTimeout(() => {
      console.log('Client idle, disconnecting');
      socket.end();
    }, ServerConstants.IDLE_TIME_SECONDS * 1000);
  }

  private registerPacketHandlers() {
    this.packetProcessor.registerHandler(RecvOpcode.LOGIN_PASSWORD, (socket, data) => {
      console.log('Received login packet');

      // Sending packet: 00 00 04 00 00 00 00 00
      this.sendPacket(socket, PacketCreator.getAuthSuccess());
      // Implement login logic here
    });

    this.packetProcessor.registerHandler(RecvOpcode.AFTER_LOGIN, (socket, data) => {
      console.log('Received after login packet');
      this.sendPacket(socket, PacketCreator.pinAccepted());
    });


    this.packetProcessor.registerHandler(RecvOpcode.SERVERLIST_REQUEST, (socket, data) => {
      console.log('Received server list request');
      // Implement server list logic here
      
    });

    // Add more handlers for other packet types
  }
}

// Usage
const loginServer = new LoginServer(8484);

// Test packet decoding
const testPacketDecoder = () => {
  console.log("Starting test packet decoding...");

  const testHeader = Buffer.from([0x29, 0xEC, 0xA3, 0xEC]);
  const testHeaderInt = new Int(testHeader.readInt32LE(0));
  const testIv = Buffer.from([0x46, 0x72, 0x7A, 0xEC]);
  const testMapleVersion = new Short(83);

  const receiveCypher = new MapleAESOFB(testIv, testMapleVersion);
  const decoder = new PacketDecoder(receiveCypher);

  console.log(`Test header: ${testHeader.toString('hex')}`);
  console.log(`Test IV: ${testIv.toString('hex')}`);
  console.log(`Test MapleVersion: ${testMapleVersion.getValue()}`);

  const isValid = receiveCypher.isValidHeader(testHeaderInt);
  console.log(`Is header valid: ${isValid}`);

};

// Run the test
testPacketDecoder();
