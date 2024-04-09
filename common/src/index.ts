import z from "zod"

export const signUpInputs = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name:z.string().optional()
})

export const signInInputs = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})
export const createBlogInputs = z.object({
    title: z.string(),
    content: z.string()
})
export const updateBlogInputs = z.object({
    title: z.string(),
    content: z.string()
})


export type SignupInput = z.infer<typeof signUpInputs>


export type SignInInput = z.infer<typeof signInInputs>


export type CreateBlogInputs = z.infer<typeof createBlogInputs>


export type UpdateBlogInputs = z.infer<typeof updateBlogInputs>
