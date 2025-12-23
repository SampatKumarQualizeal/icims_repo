
export function generateUniqueName(prefix: string) {
  const ts = Date.now().toString(36).toUpperCase();
  return `${prefix}_${ts}`;
}

  export function dateAdd(
  part: 'dd' | 'mm' | 'yy',
  num: number,
  format: string,
  options?: { pad?: boolean }
): string {
  const pad = options?.pad ?? true; // default = padded
  const date = new Date();

  // Apply arithmetic
  switch (part) {
    case 'dd':
      date.setDate(date.getDate() + num);
      break;
    case 'mm':
      date.setMonth(date.getMonth() + num);
      break;
    case 'yy':
      date.setFullYear(date.getFullYear() + num);
      break;
  }

  // Extract parts
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const yyyy = date.getFullYear();
  const yy = String(yyyy).slice(-2);

  // Decide padded vs unpadded versions
  const dd = pad ? String(d).padStart(2, '0') : String(d);
  const mm = pad ? String(m).padStart(2, '0') : String(m);

  // Token replacement
  return format
    .replace(/dd/g, dd)
    .replace(/d(?!d)/g, String(d))       // support single "d"
    .replace(/mm/g, mm)
    .replace(/m(?!m)/g, String(m))       // single "m"
    .replace(/yyyy/g, String(yyyy))
    .replace(/yy/g, yy);
}


