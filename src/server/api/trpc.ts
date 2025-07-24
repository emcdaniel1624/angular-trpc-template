import { initTRPC } from '@trpc/server';
import { z, ZodError } from 'zod';
import { db } from '../db';
import superjson from "superjson";
import * as trpcExpress from '@trpc/server/adapters/express';
import { eq } from 'drizzle-orm';
import { posts } from '../db/schema';
import { auth } from '../auth/auth';
//import { fromNodeHeaders } from 'better-auth/node';

export const createContext = async (opts: trpcExpress.CreateExpressContextOptions) => {
  return {
    db,
    auth,
    ...opts
  }
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const publicProcedure = t.procedure;
const router = t.router;

//const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
//  const session = await ctx.auth.api.getSession({
//    headers: fromNodeHeaders(ctx.req.headers),
//  });
//  if (!session) {
//    throw new Error('Unauthorized');
//  }
//  return next({
//    ctx: {
//      ...ctx,
//      session,
//    },
//  });
//});

//const authenticatedRouter = t.router({
//  hello: authenticatedProcedure.query(() => {
//    return 'Hello authenticated user!';
//  })
//});

export const appRouter = router({
  posts: {
    getAll: publicProcedure.query(async ({ ctx }) => {
      return ctx.db.query.posts.findMany()
    }),
    getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
      const post =
        ctx.db
          .select()
          .from(posts)
          .where(eq(posts.id, input))
      if (!post) throw new Error('Post not found');
      return post;
    }),
    create: publicProcedure
      .input(z.object({
        title: z.string(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newPost = {
          title: input.title,
          content: input.content || '',
        };
        const [createdPost] = await ctx.db.insert(posts).values(newPost).returning();
        return createdPost;
      }),
    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const deletedPost = await ctx.db.delete(posts).where(eq(posts.id, input)).returning();
        if (!deletedPost) throw new Error('Post not found');
        return deletedPost;
      }),
  }
});

export type AppRouter = typeof appRouter;

