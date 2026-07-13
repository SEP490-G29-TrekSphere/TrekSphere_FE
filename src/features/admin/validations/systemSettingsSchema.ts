import * as z from 'zod';

export const systemSettingsSchema = z
  .object({
    maxRainfall: z.number({
      message: 'Threshold values out of acceptable range',
    }),
    maxWindSpeed: z.number({
      message: 'Threshold values out of acceptable range',
    }),
    minTemperature: z.number({
      message: 'Threshold values out of acceptable range',
    }),
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    backupInterval: z.string(),
    require2fa: z.boolean(),
  })
  .refine(
    (data) => {
      // Validate acceptable ranges:
      // Rainfall: 0 to 500 mm
      // Wind speed: 0 to 200 km/h
      // Temperature: -50 to 60 °C
      const isRainfallValid = data.maxRainfall >= 0 && data.maxRainfall <= 500;
      const isWindSpeedValid = data.maxWindSpeed >= 0 && data.maxWindSpeed <= 200;
      const isTemperatureValid = data.minTemperature >= -50 && data.minTemperature <= 60;

      return isRainfallValid && isWindSpeedValid && isTemperatureValid;
    },
    {
      message: 'Threshold values out of acceptable range',
      path: ['maxRainfall'], // point to maxRainfall as primary or target general form
    }
  );

export type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;
