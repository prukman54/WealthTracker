import { getSupabaseClient } from "./supabase"

export const signUp = async (
  email: string,
  password: string,
  userData: {
    name: string
    phone: string
    country: string
  },
) => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  if (error) throw error

  if (data.user) {
    // Insert user data into users table
    const { error: insertError } = await supabase.from("users").insert({
      user_id: data.user.id,
      name: userData.name,
      email: email,
      phone: userData.phone,
      country: userData.country,
    })

    if (insertError) throw insertError
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const isAdmin = (email: string | undefined) => {
  return email === "prukman54@gmail.com"
}
