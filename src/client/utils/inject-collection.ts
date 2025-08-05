import {
  signal,
  effect,
  DestroyRef,
  inject,
  untracked
} from '@angular/core'
import { CollectionConfig, Context, createCollection, createLiveQueryCollection, InitialQueryBuilder, QueryBuilder, ResolveInsertInput, ResolveType, UtilsRecord } from '@tanstack/db'
import { StandardSchemaV1 } from '@standard-schema/spec'

export function injectLiveQuery<TContext extends Context>(query: ((q: InitialQueryBuilder) => QueryBuilder<TContext>) | QueryBuilder<TContext>) {

  const collection = createLiveQueryCollection({ query })
  const destroyRef = inject(DestroyRef)

  type InferredType = ReturnType<typeof collection.values> extends IterableIterator<infer T> ? T : never
  const data = signal<InferredType[]>([])
  const isLoading = signal(true)
  const error = signal<Error | null>(null)

  effect(() => {
    let isActive = true

    const initialize = async () => {
      try {
        await collection.preload()

        if (!isActive) return

        untracked(() => {
          const initialData = Array.from(collection.values())
          data.set(initialData)
          isLoading.set(false)
          error.set(null)
        })
      } catch (err) {
        if (isActive) {
          untracked(() => {
            error.set(err as Error)
            isLoading.set(false)
          })
        }
      }
    }

    const unsubscribe = collection.subscribeChanges((changes) => {
      if (!isActive) return

      untracked(() => {
        data.update(currentData => {
          let newData = [...currentData]

          for (const change of changes) {
            switch (change.type) {
              case 'insert':
                const key = collection.getKeyFromItem(change.value)
                if (!newData.some(item => collection.getKeyFromItem(item) === key)) {
                  newData.push(change.value)
                }
                break

              case 'update':
                const keyToUpdate = collection.getKeyFromItem(change.value)
                newData = newData.map(item =>
                  collection.getKeyFromItem(item) === keyToUpdate ? change.value : item
                )
                break

              case 'delete':
                const keyToDelete = collection.getKeyFromItem(change.value)
                newData = newData.filter(item => collection.getKeyFromItem(item) !== keyToDelete)
                break
            }
          }

          return newData
        })
      })
    })

    initialize()

    return () => {
      isActive = false
      unsubscribe?.()
    }
  })

  destroyRef.onDestroy(() => {
  })

  return {
    data: data.asReadonly(),
    isLoading: isLoading.asReadonly(),
    error: error.asReadonly(),
    insert: collection.insert,
    remove: collection.delete,
    update: collection.update,
    collection
  }
}

export function injectCollection<TExplicit = unknown, TKey extends string | number = string | number, TUtils extends UtilsRecord = {}, TSchema extends StandardSchemaV1 = StandardSchemaV1, TFallback extends object = Record<string, unknown>>(options: CollectionConfig<ResolveType<TExplicit, TSchema, TFallback>, TKey, TSchema, ResolveInsertInput<TExplicit, TSchema, TFallback>> & {
  utils?: TUtils;
}) {
  const collection = createCollection(options)
  const destroyRef = inject(DestroyRef)

  const data = signal<ResolveType<TExplicit, TSchema, TFallback>[]>([])
  const isLoading = signal(true)
  const error = signal<Error | null>(null)

  effect(() => {
    let isActive = true

    const initialize = async () => {
      try {
        await collection.preload()

        if (!isActive) return

        untracked(() => {
          const initialData = Array.from(collection.values())
          data.set(initialData)
          isLoading.set(false)
          error.set(null)
        })
      } catch (err) {
        if (isActive) {
          untracked(() => {
            error.set(err as Error)
            isLoading.set(false)
          })
        }
      }
    }

    const unsubscribe = collection.subscribeChanges((changes) => {
      if (!isActive) return

      untracked(() => {
        data.update(currentData => {
          let newData = [...currentData]

          for (const change of changes) {
            switch (change.type) {
              case 'insert':
                const key = collection.getKeyFromItem(change.value)
                if (!newData.some(item => collection.getKeyFromItem(item) === key)) {
                  newData.push(change.value)
                }
                break

              case 'update':
                const keyToUpdate = collection.getKeyFromItem(change.value)
                newData = newData.map(item =>
                  collection.getKeyFromItem(item) === keyToUpdate ? change.value : item
                )
                break

              case 'delete':
                const keyToDelete = collection.getKeyFromItem(change.value)
                newData = newData.filter(item => collection.getKeyFromItem(item) !== keyToDelete)
                break
            }
          }

          return newData
        })
      })
    })

    initialize()

    return () => {
      isActive = false
      unsubscribe?.()
    }
  })

  destroyRef.onDestroy(() => {
  })

  return {
    data: data.asReadonly(),
    isLoading: isLoading.asReadonly(),
    error: error.asReadonly(),
    insert: collection.insert,
    remove: collection.delete,
    update: collection.update,
    collection
  }
}
