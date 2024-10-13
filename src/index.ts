import * as net from 'net';
import * as crypto from 'crypto';

enum RecvOpcode {
  CUSTOM_PACKET = 0x3713,
  LOGIN_PASSWORD = 0x01,
  GUEST_LOGIN = 0x02,
  SERVERLIST_REREQUEST = 0x04,
  CHARLIST_REQUEST = 0x05,
  SERVERSTATUS_REQUEST = 0x06,
  ACCEPT_TOS = 0x07,
  SET_GENDER = 0x08,
  AFTER_LOGIN = 0x09,
  REGISTER_PIN = 0x0A,
  SERVERLIST_REQUEST = 0x0B,
  PLAYER_DC = 0x0C,
  VIEW_ALL_CHAR = 0x0D,
  PICK_ALL_CHAR = 0x0E,
  NAME_TRANSFER = 0x10,
  WORLD_TRANSFER = 0x12,
  CHAR_SELECT = 0x13,
  PLAYER_LOGGEDIN = 0x14,
  CHECK_CHAR_NAME = 0x15,
  CREATE_CHAR = 0x16,
  DELETE_CHAR = 0x17,
  PONG = 0x18,
  CLIENT_START_ERROR = 0x19,
  CLIENT_ERROR = 0x1A,
  STRANGE_DATA = 0x1B,
  RELOG = 0x1C,
  REGISTER_PIC = 0x1D,
  CHAR_SELECT_WITH_PIC = 0x1E,
  VIEW_ALL_PIC_REGISTER = 0x1F,
  VIEW_ALL_WITH_PIC = 0x20,
  CHANGE_MAP = 0x26,
  CHANGE_CHANNEL = 0x27,
  ENTER_CASHSHOP = 0x28,
  MOVE_PLAYER = 0x29,
  CANCEL_CHAIR = 0x2A,
  USE_CHAIR = 0x2B,
  CLOSE_RANGE_ATTACK = 0x2C,
  RANGED_ATTACK = 0x2D,
  MAGIC_ATTACK = 0x2E,
  TOUCH_MONSTER_ATTACK = 0x2F,
  TAKE_DAMAGE = 0x30,
  GENERAL_CHAT = 0x31,
  CLOSE_CHALKBOARD = 0x32,
  FACE_EXPRESSION = 0x33,
  USE_ITEMEFFECT = 0x34,
  USE_DEATHITEM = 0x35,
  MOB_BANISH_PLAYER = 0x38,
  MONSTER_BOOK_COVER = 0x39,
  NPC_TALK = 0x3A,
  REMOTE_STORE = 0x3B,
  NPC_TALK_MORE = 0x3C,
  NPC_SHOP = 0x3D,
  STORAGE = 0x3E,
  HIRED_MERCHANT_REQUEST = 0x3F,
  FREDRICK_ACTION = 0x40,
  DUEY_ACTION = 0x41,
  OWL_ACTION = 0x42,
  OWL_WARP = 0x43,
  ADMIN_SHOP = 0x44,
  ITEM_SORT = 0x45,
  ITEM_SORT2 = 0x46,
  ITEM_MOVE = 0x47,
  USE_ITEM = 0x48,
  CANCEL_ITEM_EFFECT = 0x49,
  USE_SUMMON_BAG = 0x4B,
  PET_FOOD = 0x4C,
  USE_MOUNT_FOOD = 0x4D,
  SCRIPTED_ITEM = 0x4E,
  USE_CASH_ITEM = 0x4F,
  USE_CATCH_ITEM = 0x51,
  USE_SKILL_BOOK = 0x52,
  USE_TELEPORT_ROCK = 0x54,
  USE_RETURN_SCROLL = 0x55,
  USE_UPGRADE_SCROLL = 0x56,
  DISTRIBUTE_AP = 0x57,
  AUTO_DISTRIBUTE_AP = 0x58,
  HEAL_OVER_TIME = 0x59,
  DISTRIBUTE_SP = 0x5A,
  SPECIAL_MOVE = 0x5B,
  CANCEL_BUFF = 0x5C,
  SKILL_EFFECT = 0x5D,
  MESO_DROP = 0x5E,
  GIVE_FAME = 0x5F,
  CHAR_INFO_REQUEST = 0x61,
  SPAWN_PET = 0x62,
  CANCEL_DEBUFF = 0x63,
  CHANGE_MAP_SPECIAL = 0x64,
  USE_INNER_PORTAL = 0x65,
  TROCK_ADD_MAP = 0x66,
  REPORT = 0x6A,
  QUEST_ACTION = 0x6B,
  GRENADE_EFFECT = 0x6D,
  SKILL_MACRO = 0x6E,
  USE_ITEM_REWARD = 0x70,
  MAKER_SKILL = 0x71,
  USE_REMOTE = 0x74,
  WATER_OF_LIFE = 0x75,
  ADMIN_CHAT = 0x76,
  MULTI_CHAT = 0x77,
  WHISPER = 0x78,
  SPOUSE_CHAT = 0x79,
  MESSENGER = 0x7A,
  PLAYER_INTERACTION = 0x7B,
  PARTY_OPERATION = 0x7C,
  DENY_PARTY_REQUEST = 0x7D,
  GUILD_OPERATION = 0x7E,
  DENY_GUILD_REQUEST = 0x7F,
  ADMIN_COMMAND = 0x80,
  ADMIN_LOG = 0x81,
  BUDDYLIST_MODIFY = 0x82,
  NOTE_ACTION = 0x83,
  USE_DOOR = 0x85,
  CHANGE_KEYMAP = 0x87,
  RPS_ACTION = 0x88,
  RING_ACTION = 0x89,
  WEDDING_ACTION = 0x8A,
  WEDDING_TALK = 0x8B,
  WEDDING_TALK_MORE = 0x8B,
  ALLIANCE_OPERATION = 0x8F,
  DENY_ALLIANCE_REQUEST = 0x90,
  OPEN_FAMILY_PEDIGREE = 0x91,
  OPEN_FAMILY = 0x92,
  ADD_FAMILY = 0x93,
  SEPARATE_FAMILY_BY_SENIOR = 0x94,
  SEPARATE_FAMILY_BY_JUNIOR = 0x95,
  ACCEPT_FAMILY = 0x96,
  USE_FAMILY = 0x97,
  CHANGE_FAMILY_MESSAGE = 0x98,
  FAMILY_SUMMON_RESPONSE = 0x99,
  BBS_OPERATION = 0x9B,
  ENTER_MTS = 0x9C,
  USE_SOLOMON_ITEM = 0x9D,
  USE_GACHA_EXP = 0x9E,
  NEW_YEAR_CARD_REQUEST = 0x9F,
  CASHSHOP_SURPRISE = 0xA1,
  CLICK_GUIDE = 0xA2,
  ARAN_COMBO_COUNTER = 0xA3,
  MOVE_PET = 0xA7,
  PET_CHAT = 0xA8,
  PET_COMMAND = 0xA9,
  PET_LOOT = 0xAA,
  PET_AUTO_POT = 0xAB,
  PET_EXCLUDE_ITEMS = 0xAC,
  MOVE_SUMMON = 0xAF,
  SUMMON_ATTACK = 0xB0,
  DAMAGE_SUMMON = 0xB1,
  BEHOLDER = 0xB2,
  MOVE_DRAGON = 0xB5,
  CHANGE_QUICKSLOT = 0xB7,
  MOVE_LIFE = 0xBC,
  AUTO_AGGRO = 0xBD,
  FIELD_DAMAGE_MOB = 0xBF,
  MOB_DAMAGE_MOB_FRIENDLY = 0xC0,
  MONSTER_BOMB = 0xC1,
  MOB_DAMAGE_MOB = 0xC2,
  NPC_ACTION = 0xC5,
  ITEM_PICKUP = 0xCA,
  DAMAGE_REACTOR = 0xCD,
  TOUCHING_REACTOR = 0xCE,
  PLAYER_MAP_TRANSFER = 0xCF,
  MAPLETV = 0xFFFE,
  SNOWBALL = 0xD3,
  LEFT_KNOCKBACK = 0xD4,
  COCONUT = 0xD5,
  MATCH_TABLE = 0xD6,
  MONSTER_CARNIVAL = 0xDA,
  PARTY_SEARCH_REGISTER = 0xDC,
  PARTY_SEARCH_START = 0xDE,
  PARTY_SEARCH_UPDATE = 0xDF,
  CHECK_CASH = 0xE4,
  CASHSHOP_OPERATION = 0xE5,
  COUPON_CODE = 0xE6,
  OPEN_ITEMUI = 0xEC,
  CLOSE_ITEMUI = 0xED,
  USE_ITEMUI = 0xEE,
  MTS_OPERATION = 0xFD,
  USE_MAPLELIFE = 0x100,
  USE_HAMMER = 0x104
}

namespace ServerConstants {
export const VERSION_BYTES = Buffer.from([0, 83]);
  export const IDLE_TIME_SECONDS = 30;
}

import { Buffer } from 'buffer';

class Short {
    private value: number;

    constructor(value: number) {
        // Ensure the value is within the range of a 16-bit signed integer
        this.value = Short.toShort(value);
    }

    static toShort(value: number): number {
        // Convert to 16-bit signed integer
        return (value << 16) >> 16;
    }

    getValue(): number {
        return this.value;
    }

    // Static method to get the minimum value of a short
    static MIN_VALUE: number = -32768;

    // Static method to get the maximum value of a short
    static MAX_VALUE: number = 32767;

    // Add two shorts
    add(other: Short): Short {
        return new Short(Short.toShort(this.value + other.getValue()));
    }

    // Subtract two shorts
    subtract(other: Short): Short {
        return new Short(Short.toShort(this.value - other.getValue()));
    }

    // Multiply two shorts
    multiply(other: Short): Short {
        return new Short(Short.toShort(this.value * other.getValue()));
    }

    // Divide two shorts
    divide(other: Short): Short {
        if (other.getValue() === 0) {
            throw new Error("Division by zero");
        }
        return new Short(Short.toShort(Math.trunc(this.value / other.getValue())));
    }

    // Compare two shorts
    compareTo(other: Short): number {
        return this.value - other.getValue();
    }

    // Convert to string
    toString(): string {
        return this.value.toString();
    }

    // Swap bytes of the short
    swapBytes(): Short {
        return new Short(((this.value >> 8) & 0xFF) | ((this.value << 8) & 0xFF00));
    }

    // Static method to create a Short with swapped bytes
    static fromSwappedBytes(value: number): Short {
        return new Short(((value >> 8) & 0xFF) | ((value << 8) & 0xFF00));
    }
}

class Int {
    private value: number;

    constructor(value: number) {
        this.value = Int.toInt(value);
    }

    getValue(): number {
        return this.value;
    }

    // Static method to convert a number to a 32-bit integer
    static toInt(value: number): number {
        return value | 0;  // Bitwise OR with 0 to convert to 32-bit integer
    }

    // Static method to get the minimum value of an int
    static MIN_VALUE: number = -2147483648;

    // Static method to get the maximum value of an int
    static MAX_VALUE: number = 2147483647;

    // Add two ints
    add(other: Int): Int {
        return new Int(this.value + other.getValue());
    }

    // Subtract two ints
    subtract(other: Int): Int {
        return new Int(this.value - other.getValue());
    }

    // Multiply two ints
    multiply(other: Int): Int {
        return new Int(this.value * other.getValue());
    }

    // Divide two ints
    divide(other: Int): Int {
        if (other.getValue() === 0) {
            throw new Error("Division by zero");
        }
        return new Int(Math.trunc(this.value / other.getValue()));
    }

    // Compare two ints
    compareTo(other: Int): number {
        return this.value - other.getValue();
    }

    // Convert to string
    toString(): string {
        return this.value.toString();
    }

    // Swap bytes of the int
    swapBytes(): Int {
        return new Int(
            ((this.value & 0xFF) << 24) |
            ((this.value & 0xFF00) << 8) |
            ((this.value >> 8) & 0xFF00) |
            ((this.value >> 24) & 0xFF)
        );
    }

    // Static method to create an Int with swapped bytes
    static fromSwappedBytes(value: number): Int {
        return new Int(
            ((value & 0xFF) << 24) |
            ((value & 0xFF00) << 8) |
            ((value >> 8) & 0xFF00) |
            ((value >> 24) & 0xFF)
        );
    }
}



class ByteBufOutPacket implements OutPacket {
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


class PacketCreator {
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
}
// The crypto import is already present at the top of the file, so we don't need to import it again.

class MapleAESOFB {
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

  getPacketHeader(length: number): Buffer {
    let iiv = this.iv[3] & 0xFF;
    iiv |= (this.iv[2] << 8) & 0xFF00;

    iiv ^= this.mapleVersion.getValue();

    const mlength = ((length << 8) & 0xFF00) | (length >>> 8);
    const xoredIv = iiv ^ mlength;
    const ret = Buffer.alloc(4);
    ret.writeUInt8((iiv >>> 8) & 0xFF, 0);
    ret.writeUInt8(iiv & 0xFF, 1);
    ret.writeUInt8((xoredIv >>> 8) & 0xFF, 2);
    ret.writeUInt8(xoredIv & 0xFF, 3);
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



class ClientCiphers {
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

class PacketProcessor {
  private handlers: Map<number, (data: Buffer) => void>;

  constructor() {
    this.handlers = new Map();
  }

  registerHandler(opcode: number, handler: (data: Buffer) => void) {
    this.handlers.set(opcode, handler);
  }

  processPacket(opcode: number, data: Buffer) {
    const handler = this.handlers.get(opcode);
    if (handler) {
      handler(data);
    } else {
      console.log(`No handler for opcode: ${opcode}`);
    }
  }
}

class MapleCustomEncryption {
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
class PacketDecoder {
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

class PacketBuffer {
  private buffer: Buffer;
  private decoder: PacketDecoder;

  constructor(receiveCypher: MapleAESOFB) {
    this.buffer = Buffer.alloc(0);
    this.decoder = new PacketDecoder(receiveCypher);
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

class LoginServer {
  private server: net.Server;
  private packetProcessor: PacketProcessor;
  private packetBuffer: PacketBuffer;
  private receiveCypher: MapleAESOFB;

  constructor(port: number) {
    const receiveIv = this.generateInitializationVector('receive');
    this.packetProcessor = new PacketProcessor();
    this.receiveCypher = new MapleAESOFB(receiveIv, new Short(83));
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
    const sendIv = this.generateInitializationVector('send');
    const recvIv = this.receiveCypher.iv;

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

  private sendHelloPacket(socket: net.Socket, sendIv: Buffer, recvIv: Buffer) {
    const packet = PacketCreator.getHello(83, sendIv, recvIv);
    console.log(`Sending hello packet: ${packet.toString('hex')}`);
    socket.write(packet);
  }

  private setupHandlers(socket: net.Socket, sendIv: Buffer, recvIv: Buffer, clientSessionId: number) {
    const ciphers = new ClientCiphers(sendIv, recvIv);
    let idleTimer = this.startIdleTimer(socket);

    const originalWrite = socket.write;
    socket.write = (data: Buffer | string) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const encoded = ciphers.encrypt(buffer);
      return originalWrite.call(socket, encoded);
    };

    socket.on('data', (data: Buffer) => {
      clearTimeout(idleTimer);
      idleTimer = this.startIdleTimer(socket);
      console.log('Received data:', data.toString('hex'));
      this.packetBuffer.append(data);

      while (this.packetBuffer.getNextPacket()) {
        const packet = this.packetBuffer.getNextPacket();
        if (packet) {
          const opcode = packet.readInt16LE(0);
          console.log(`Received opcode: ${opcode}`);
          this.packetProcessor.processPacket(opcode, packet.subarray(2));
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
    this.packetProcessor.registerHandler(RecvOpcode.LOGIN_PASSWORD, (data) => {
      console.log('Received login packet');
      // Implement login logic here
    });

    this.packetProcessor.registerHandler(RecvOpcode.SERVERLIST_REQUEST, (data) => {
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
