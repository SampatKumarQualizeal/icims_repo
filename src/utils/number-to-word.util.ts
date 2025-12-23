// src/utils/number-to-word.util.ts

/**
 * Utility to convert numbers (0-99) to word format
 * Used for generating unique test data based on current time
 * 
 * Examples:
 * - 0 => "Zero"
 * - 13 => "Thirteen"
 * - 54 => "Fiftyfour"
 * - 23 => "Twentythree"
 */
export class NumberToWordUtil {
  private static readonly ONES = [
    'Zero', 'One', 'Two', 'Three', 'Four', 
    'Five', 'Six', 'Seven', 'Eight', 'Nine'
  ];
  
  private static readonly TENS = [
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  private static readonly TWENTIES = [
    'Twenty', 'Thirty', 'Forty', 'Fifty', 
    'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  /**
   * Convert a number to its word representation
   * @param num - Number between 0-99
   * @returns Word representation (e.g., "Thirteen", "Fiftyfour")
   */
  static convert(num: number): string {
    if (num < 0 || num > 99) {
      throw new Error('Number must be between 0 and 99');
    }

    if (num < 10) {
      return this.ONES[num];
    }
    
    if (num < 20) {
      return this.TENS[num - 10];
    }
    
    const digit = num % 10;
    const ten = Math.floor(num / 10);
    
    if (digit === 0) {
      return this.TWENTIES[ten - 2];
    }
    
    return this.TWENTIES[ten - 2] + this.ONES[digit].toLowerCase();
  }

  /**
   * Get current hour as word (0-23)
   */
  static currentHourAsWord(): string {
    const now = new Date();
    return this.convert(now.getHours());
  }

  /**
   * Get current minute as word (0-59)
   */
  static currentMinuteAsWord(): string {
    const now = new Date();
    return this.convert(now.getMinutes());
  }
}
