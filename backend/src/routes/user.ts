import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signUpInputs , signInInputs} from "@bloghers/zod-validation";


export const userRouter = new Hono<{
    Bindings:{
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }>();


userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success} = signUpInputs.safeParse(body)

    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    try {

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password
            }
        });

        const jwt = await sign({
            id: user.id
        }, c.env.JWT_SECRET)
        return c.text("User Signed Up "+ jwt +  "   " + user.id)

    } catch (error) {
        console.log(error)
        c.status(411);
        return c.text("ERROR!")
    }
})

userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: "prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiYTgxZDljOTQtYWYwMS00MjNkLWFkYjQtNDcwODBmYzhmYzQ1IiwidGVuYW50X2lkIjoiZmMxMmE1Yjk2YzcxODUzOTMyZjdlOGFkMzg1MjhmNWVkODYyOTRkNDM0NmExMzY5NWI4MDQ5MjY4OWI5MWRjMCIsImludGVybmFsX3NlY3JldCI6IjZmMTI4MjViLTg0ZjMtNDYzMS1hNGM0LWU5Y2I2NWU2ODY2YSJ9.jU79MvTdbEXz2DZS8m5iyrP7Kr0_TRiBY7djbrS_Lm8",
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success} = signInInputs.safeParse(body)

    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    try {

        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password
            }
        });
        if (!user) {
            c.status(403);
            return c.text("user not found")
        }
        const jwt = await sign({
            id: user?.id
        }, c.env.JWT_SECRET)
        return c.text("User SignedIn")

    } catch (error) {
        console.log(error)
        c.status(411);
        return c.text("ERROR!")
    }
})