import { Component, input } from "@angular/core"
import { injectField } from "@tanstack/angular-form"

@Component({
  selector: 'text-field',
  template: `
    <label [for]="field.api.name" class="block text-sm font-medium text-slate-700 mb-1">
      {{ label() }}
    </label>

    @if (type() === 'input') {
      <input
        [id]="field.api.name"
        [name]="field.api.name"
        [value]="field.api.state.value"
        (blur)="field.api.handleBlur()"
        (input)="field.api.handleChange($any($event).target.value)"
        class="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      />
    }
    @else if (type() === 'text-area') {
      <textarea
        [id]="field.api.name"
        [name]="field.api.name"
        [value]="field.api.state.value"
        (blur)="field.api.handleBlur()"
        (input)="field.api.handleChange($any($event).target.value)"
        class="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      ></textarea>
    }

    @if (field.api.state.meta.isTouched) {
      @for (error of field.api.state.meta.errors; track $index) {
        <div style="color: red">
          {{ error }}
        </div>
      }
    }
    @if (field.api.state.meta.isValidating) {
      <p>Validating...</p>
    }
  `,
})
export class TextField {
  label = input.required<string>()
  type = input.required<'text-area' | 'input'>()
  field = injectField<string>()
}
