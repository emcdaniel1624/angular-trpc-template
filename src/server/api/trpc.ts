import { initTRPC } from '@trpc/server';
import { z, ZodError } from 'zod';
import { db } from '../db';
import superjson from "superjson";
import * as trpcExpress from '@trpc/server/adapters/express';
import { eq } from 'drizzle-orm';
import { posts } from '../db/schema';

export const createContext = async (opts: trpcExpress.CreateExpressContextOptions) => {
  return {
    db,
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
  }
});

export type AppRouter = typeof appRouter;

