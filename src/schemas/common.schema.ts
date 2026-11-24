import { z } from 'zod';

// /spaces/abc o /spaces/-1 no llegan al Service.
export const idParamSchema = z.object({
  id: z.coerce
    .number({ error: 'id debe ser un numero' })
    .int('id debe ser un entero')
    .positive('id debe ser mayor que 0')
});
