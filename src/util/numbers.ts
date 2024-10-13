export class Short {
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

export class Int {
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