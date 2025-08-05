import { Component } from '@angular/core'
import { api } from './utils'
import { PostCard } from './components/post-card'
import { AddPostForm } from "./components/add-post-form";
import { inferRouterInputs } from '@trpc/server';
import { AppRouter } from '../server/api/trpc';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import z from 'zod';
import { injectCollection } from './utils/inject-collection';

@Component({
  selector: 'app',
  imports: [PostCard, AddPostForm],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="text-center mb-12">
          <h1
            class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight py-2"
          >
            Modern Angular Template
          </h1>
          <p class="text-slate-600 text-lg">Modern full-stack application</p>
        </div>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (post of postsCollection.data(); track post.id) {
              <post-card [post]="post" (delete)="postsCollection.remove($event)"/>
            }
          </div>
      </div>

      <add-post-form (onSubmit)="addPost($event)"/>
    </div>
  `,
})
export class App {
  addPost(input: inferRouterInputs<AppRouter>['posts']['create']) {
    this.postsCollection.insert({
      id: Math.floor(Math.random() * 100000),
      title: input.title,
      content: input.content || ''
    })
  }

  postsCollection = injectCollection(
    electricCollectionOptions({
      id: 'sync-posts',
      shapeOptions: {
        url: 'http://localhost:3000/v1/shape',
        params: {
          table: 'posts',
        }
      },
      getKey: post => post.id,
      schema: z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
      }),
      onInsert: async ({ transaction }) => {
        const post = transaction.mutations[0].modified
        const result = await api.posts.create.mutate(post)
        return { txid: result.txid }
      },
      onDelete: async ({ transaction }) => {
        const mutation = transaction.mutations[0]
        const result = await api.posts.delete.mutate(mutation.original.id)
        return { txid: result.txid }
      }
    })
  )
}
