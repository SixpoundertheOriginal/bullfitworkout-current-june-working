
export type WeightUnit = "kg" | "lbs";

/**
 * Converts weight values between kg and lbs units
 * @param value The weight value to convert
 * @param from The source unit ('kg' or 'lbs')
 * @param to The target unit ('kg' or 'lbs')
 * @returns The converted weight value, rounded to 1 decimal place
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  
  // Convert to target unit
  let result: number;
  if (from === "kg" && to === "lbs") {
    result = value * 2.20462;
  } else {
    // from === "lbs" && to === "kg"
    result = value / 2.20462;
  }
  
  // Round to 1 decimal place
  return Math.round(result * 10) / 10;
}

/**
 * Formats a weight value with its unit for display
 * @param value The weight value
 * @param unit The weight unit ('kg' or 'lbs')
 * @param decimalPlaces Optional number of decimal places (default: 1)
 * @returns Formatted string like "100.0 kg"
 */
export function formatWeightWithUnit(value: number, unit: WeightUnit, decimalPlaces: number = 1): string {
  return `${value.toFixed(decimalPlaces)} ${unit}`;
}
