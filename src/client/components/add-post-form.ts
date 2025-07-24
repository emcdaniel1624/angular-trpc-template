import { Component, output } from "@angular/core";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { TextField } from "./text-field";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'add-post-form',
  imports: [TextField, TanStackField, TanStackAppField, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">

      <h2 class="text-3xl font-semibold mb-6">Create New Post</h2>
      <form (ngSubmit)="form.handleSubmit()" class="space-y-4">
        <text-field
          label="Title"
          tanstack-app-field
          [tanstackField]="form"
          name="title"
          type="input"
        />
        <text-field
          label="Content"
          tanstack-app-field
          [tanstackField]="form"
          name="content"
          type="text-area"
        />
        <button type="submit"
          class="w-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold py-3 cursor-pointer rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ isSubmitting() ? 'Submitting...' : 'Add Post' }}
        </button>
      </form>

    </div>
  `
})
export class AddPostForm {
  onSubmit = output<{ title: string, content: string }>();

  form = injectForm({
    defaultValues: { title: '', content: '' },
    onSubmit: ({ value }) => {
      this.onSubmit.emit(value);
      this.form.reset({ title: '', content: '' });
    }
  })

  isSubmitting = injectStore(this.form, (state) => state.isSubmitting)
}
