import { initTRPC } from '@trpc/server';
import { z, ZodError } from 'zod';
import { db } from '../db';
import superjson from "superjson";
import * as trpcExpress from '@trpc/server/adapters/express';
import { eq, sql } from 'drizzle-orm';
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

async function generateTxId(
  tx: Parameters<
    Parameters<typeof import("../db/index").db.transaction>[0]
  >[0]
): Promise<number> {
  // The ::xid cast strips off the epoch, giving you the raw 32-bit value
  // that matches what PostgreSQL sends in logical replication streams
  // (and then exposed through Electric which we'll match against
  // in the client).
  const result = await tx.execute(
    sql`SELECT pg_current_xact_id()::xid::text as txid`
  )
  const txid = result[0]['txid'];

  if (txid === undefined) {
    throw new Error(`Failed to get transaction ID`)
  }

  return parseInt(txid as string, 10)
}

const createPostInput = z.object({
  title: z.string(),
  content: z.string().optional(),
})

export type CreatePostInput = z.infer<typeof createPostInput>;

const createPostMutation = t.procedure
  .input(createPostInput)
  .mutation(async ({ ctx, input }) => {
    const newPost = {
      title: input.title,
      content: input.content || '',
    };
    const result = await ctx.db.transaction(async (tx) => {
      const txid = await generateTxId(tx);
      const [createdPost] = await tx.insert(posts).values(newPost).returning()
      return { post: createdPost, txid };
    });
    return result;
  });

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
    create: createPostMutation,
    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const result = await ctx.db.transaction(async (tx) => {
          const txid = await generateTxId(tx);
          const [deletedPost] = await tx.delete(posts).where(eq(posts.id, input)).returning()
          if (!deletedPost) throw new Error('Post not found');
          return { post: deletedPost, txid };
        });
        return result;
      }),
  }
});

export type AppRouter = typeof appRouter;

