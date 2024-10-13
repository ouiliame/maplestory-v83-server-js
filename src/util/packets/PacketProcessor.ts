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