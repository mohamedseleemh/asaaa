"use client"

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

type User = { id: string; name: string; email: string; role: "admin" | "editor" | "viewer"; active: boolean }
type AuthState = {
  user: User | null
  token: string | null
  status: "idle" | "loading" | "error"
  error?: string
  locale: "ar" | "en"
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  locale: "ar",
}

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        return rejectWithValue(data.message || "فشل تسجيل الدخول")
      }

      return data as { user: User; token: string }
    } catch (error) {
      return rejectWithValue("حدث خطأ أثناء تسجيل الدخول")
    }
  },
)

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        return rejectWithValue(data.message || "فشل التسجيل")
      }

      return data as { user: User; token: string }
    } catch (error) {
      return rejectWithValue("حدث خطأ أثناء التسجيل")
    }
  },
)

export const me = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/auth/me")

    if (!res.ok) {
      return rejectWithValue("غير مصرح")
    }

    const data = await res.json()
    return data as { user: User }
  } catch (error) {
    return rejectWithValue("حدث خطأ أثناء استرداد بيانات المستخدم")
  }
})

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST" })

    if (!res.ok) {
      return rejectWithValue("فشل تسجيل الخروج")
    }

    return true
  } catch (error) {
    return rejectWithValue("حدث خطأ أثناء تسجيل الخروج")
  }
})

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<"ar" | "en">) {
      state.locale = action.payload
    },
  },
  extraReducers(builder) {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle"
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error"
        state.error = action.error.message || "فشل تسجيل الدخول"
      })

      // register
      .addCase(register.pending, (state) => {
        state.status = "loading"
        state.error = undefined
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "idle"
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error"
        state.error = action.error.message || "فشل التسجيل"
      })

      // me
      .addCase(me.pending, (state) => {
        state.status = "loading"
      })
      .addCase(me.fulfilled, (state, action) => {
        state.status = "idle"
        state.user = action.payload.user
      })
      .addCase(me.rejected, (state) => {
        state.status = "idle"
        // لا نقوم بتعيين حالة الخطأ هنا لأن هذا قد يكون مجرد عدم وجود جلسة
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
      })
  },
})

export const { setLocale } = auth.actions
export default auth.reducer
export type { User }
