import { z } from "zod";

export const CustomerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
    phone: z.string().min(8),
});

export const CardFormSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
    phone: z.string().min(8),
    cardNumber: z.string().min(13),
    exp: z.string().regex(/^\d{2}\/\d{2}$/, 'MM/YY'),
    holder: z.string().min(2),
});

export type CardFormValues = z.infer<typeof CardFormSchema>;