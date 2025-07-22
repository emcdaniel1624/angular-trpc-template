import { Component, resource } from '@angular/core'
import { api } from './utils'

@Component({
  selector: 'app',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight py-2">
            Angular TRPC Template
          </h1>
          <p class="text-slate-600 text-lg">Modern full-stack application</p>
        </div>

        @if (posts.isLoading()) {
          <p>Loading posts...</p>
        } @else if (posts.error()) {
          <p>Error loading posts: {{ posts.error() }}</p>
        } @else if (posts.hasValue()) {
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (post of posts.value(); track post.id) {
              <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
                <h3 class="text-xl font-semibold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {{ post.title }}
                </h3>
                <p class="text-slate-600 leading-relaxed">
                  {{ post.content }}
                </p>
              </div>
            }
          </div>
        }

      </div>
    </div>
  `,
})
export class App {
  posts = resource({ loader: () => api.posts.getAll.query() })
}
