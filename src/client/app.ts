import { Component, inject } from '@angular/core'
import { api } from './utils'
import { PostCard } from './components/post-card'
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental'
import { AddPostForm } from "./components/add-post-form";

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
            Angular TRPC Template
          </h1>
          <p class="text-slate-600 text-lg">Modern full-stack application</p>
        </div>
        @if (postsQuery.isLoading()) {
          <p>Loading posts...</p>
        } @else if (postsQuery.isError()) {
          <p>Error loading posts: {{ postsQuery.error() }}</p>
        } @else if (postsQuery.isSuccess()) {
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (post of postsQuery.data(); track post.id) {
              <post-card [post]="post" (delete)="deletePost.mutate($event)"/>
            }
          </div>
        }
      </div>

      <add-post-form (onSubmit)="addPost.mutate($event)"/>
    </div>
  `,
})
export class App {
  queryClient = inject(QueryClient)

  postsQuery = injectQuery(() => ({
    queryKey: ['posts'],
    queryFn: () => api.posts.getAll.query(),
  }))

  addPost = injectMutation(() => ({
    mutationFn: (post: { title: string, content: string }) => api.posts.create.mutate(post),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: ['posts'] })
  }))

  deletePost = injectMutation(() => ({
    mutationFn: (id: number) => api.posts.delete.mutate(id),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: ['posts'] })
  }))
}
