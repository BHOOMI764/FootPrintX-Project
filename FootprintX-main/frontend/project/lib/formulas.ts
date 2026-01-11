type PhysicalInput = {
  transportationKmPerDay: number;
  energyKwhPerMonth: number;
  wasteKgPerWeek: number;
  shoppingUsdPerMonth: number;
  flightsHoursPerYear: number;
};

type DigitalInput = {
  internetGBPerMonth: number;
  streamingHoursPerMonth: number;
  cloudStorageGB: number;
  emailsPerMonth: number;
  videoCallHoursPerMonth: number;
  socialHoursPerMonth: number;
};

export function computePhysical(input: PhysicalInput) {
  // Simple estimations / placeholders
  const transportation = input.transportationKmPerDay * 365 * 0.21; // kg CO2e per km
  const energy = input.energyKwhPerMonth * 12 * 0.475; // kg CO2e per kWh
  const waste = input.wasteKgPerWeek * 52 * 0.5; // kg CO2e per kg waste
  const shopping = input.shoppingUsdPerMonth * 12 * 0.02; // kg CO2e per USD
  const flights = input.flightsHoursPerYear * 90; // rough kg CO2e per flight hour

  const breakdown = {
    transportation,
    energy,
    waste,
    shopping,
    flights,
  };

  const total = Object.values(breakdown).reduce((s, v) => s + (v || 0), 0);
  const leaderboardScore = Math.round(total);

  return { breakdown, total, leaderboardScore };
}

export function computeDigital(input: DigitalInput) {
  // Simple estimations / placeholders
  const internet = input.internetGBPerMonth * 0.02; // kg CO2e per GB per month
  const streaming = input.streamingHoursPerMonth * 0.05; // kg CO2e per hour
  const cloud = input.cloudStorageGB * 0.001; // kg CO2e per GB per month
  const emails = input.emailsPerMonth * 0.0005; // kg CO2e per email
  const videoCalls = input.videoCallHoursPerMonth * 0.06; // kg CO2e per hour
  const social = input.socialHoursPerMonth * 0.02; // kg CO2e per hour

  const breakdown = {
    internet,
    streaming,
    cloud,
    emails,
    videoCalls,
    social,
  };

  const totalMonthly = Object.values(breakdown).reduce((s, v) => s + (v || 0), 0);
  const annualScore = Math.round(totalMonthly * 12);

  return { breakdown, totalMonthly, annualScore };
}
