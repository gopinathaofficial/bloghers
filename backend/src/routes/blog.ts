import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInputs , updateBlogInputs} from "@bloghers/zod-validation";



export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string
    }
}>();


blogRouter.use('/*', async (c, next)=>{
    const authHeaders = c.req.header("Authorization") || ""
    const user = await verify(authHeaders, c.env.JWT_SECRET)

    if(user){
    console.log('helloa')

        c.set("userId", user.id)
        await next()
    }
    else{
        c.status(403)
        return c.json({
            message:"you're not logged in"
        })
    }
})
blogRouter.post('/', async (c) => {
    console.log('hello')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success} = createBlogInputs.safeParse(body)

    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const authorId = c.get("userId")
    const blog = await prisma.blog.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: Number(authorId)
        }
    })
    return c.json({
        id : blog.id
    })
})

blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success} = updateBlogInputs.safeParse(body)

    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    console.log(body)
    try {
        
        const blog = await prisma.blog.update({
            where:{
                id: body.id
            },
            data:{
                title: body.title,
                content: body.content,
            }
        })
        return c.json({
            id : blog.id
        })
    } catch (error) {
        c.text("error while fetching blog post")
        
    }
})

blogRouter.get('/getAll', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const blogs = await prisma.blog.findMany()
        return c.json({
             blogs
        })
    } catch (error) {
        c.text("error while fetching blogs")
    }
})

blogRouter.get('/:id', async(c) => {
    const id = c.req.param("id")
    console.log(id)
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const blog = await prisma.blog.findFirst({
            where:{
                id: Number(id)
            }
        })
        return c.json({
             blog
        })
    } catch (error) {
        c.text("error while fetching blog post")
    }
})
