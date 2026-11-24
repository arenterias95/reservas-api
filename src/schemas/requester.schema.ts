import { z } from 'zod';

export const createRequesterSchema = z.object({
  name: z.string({ error: 'name es obligatorio' }).trim().min(2, 'name debe tener al menos 2 caracteres'),
  email: z.email('email no es valido')
});

export const updateRequesterSchema = createRequesterSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Envie al menos un campo para actualizar');

export type CreateRequesterBody = z.infer<typeof createRequesterSchema>;
export type UpdateRequesterBody = z.infer<typeof updateRequesterSchema>;
