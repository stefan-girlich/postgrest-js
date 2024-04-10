import { expectType } from 'tsd'
import { PostgrestClient } from '../src/index'
import { Database } from './types'

const REST_URL = 'http://localhost:3000'
const postgrest = new PostgrestClient<Database>(REST_URL)

// query for field of top-level resource => succeeds
{
  const { data, error } = await postgrest.from('messages').select('numeric_value').single()
  if (error) throw new Error(error.message)
  expectType<{ numeric_value: number }>(data)
}

// `sum` on top-level resource => fails
{
  // => const data: SelectQueryError<"Referencing missing column `sum`"> | null
  const { data, error } = await postgrest.from('messages').select('numeric_value.sum()').single()
  if (error) throw new Error(error.message)
  expectType<{ sum: number }>(data)
}

// `min` and `max` on top-level resource => fails
{
  // => const data: SelectQueryError<"Referencing missing column `max`"> | null
  const { data, error } = await postgrest
    .from('messages')
    .select('numeric_value.min(), numeric_value.max()')
    .single()
  if (error) throw new Error(error.message)
  expectType<{ min: number; max: number }>(data)
}

// `sum` on embedded resource => fails
{
  // => users: SelectQueryError<"Referencing missing column `sum`"> | null
  const { data, error } = await postgrest
    .from('messages')
    .select('message, users(numeric_value.sum())')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  expectType<{ message: string | null; users: { sum: number } | null }>(data)
}
