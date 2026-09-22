import * as z from 'zod';

export const composerSchema = z.object({

  message: z.string(),
});

export type ComposerFormValues = z.infer<typeof composerSchema>;
