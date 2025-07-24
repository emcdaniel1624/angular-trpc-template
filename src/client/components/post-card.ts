import { Component, input, output } from "@angular/core";

@Component({
  selector: 'post-card',
  template: `
    <div
      class="h-full relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-300 group"
    >
      <button
        (click)="delete.emit(post().id)"
        class="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-300 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h3
        class="text-xl font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300"
      >
        {{ post().title }}
      </h3>
      <p class="text-slate-600 leading-relaxed">
        {{ post().content }}
      </p>
    </div>
  `,
})
export class PostCard {
  post = input.required<{ id: number; title: string; content: string }>();
  delete = output<number>();
}
