"use client"

import { cn } from "cn"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

type AuthFormProps = React.ComponentProps<"div"> & {
  mode?: "login" | "signup"
}

export function LoginForm({
  className,
  mode = "login",
  ...props
}: AuthFormProps) {
  const isSignup = mode === "signup"
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsPending(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = String(formData.get("email"))
      const password = String(formData.get("password"))
      const result = isSignup
        ? await authClient.signUp.email({
            email,
            password,
            name: String(formData.get("name")),
          })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(
          result.error.message ?? "Autentikasi gagal. Silakan coba lagi."
        )
        setIsPending(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Layanan autentikasi tidak dapat dihubungi.")
      setIsPending(false)
    }
  }

  async function handleGoogle() {
    setError("")
    setIsPending(true)

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: isSignup ? "/signup" : "/login",
      })

      if (result?.error) {
        setError(
          result.error.message ?? "Login Google gagal. Silakan coba lagi."
        )
        setIsPending(false)
      }
    } catch {
      setError("Layanan autentikasi tidak dapat dihubungi.")
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>
            {isSignup ? "Buat akun" : "Selamat datang kembali"}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? "Daftar dengan email atau akun Google"
              : "Masuk dengan email atau akun Google"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  disabled={isPending}
                  onClick={handleGoogle}
                  variant="outline"
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isSignup ? "Daftar dengan Google" : "Masuk dengan Google"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Atau gunakan email
              </FieldSeparator>
              {isSignup && (
                <Field>
                  <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Nama lengkap"
                    required
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={8}
                  required
                />
              </Field>
              <Field>
                {error && (
                  <p aria-live="polite" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button disabled={isPending} type="submit">
                  {isPending ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
                </Button>
                <FieldDescription className="text-center">
                  {isSignup ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                  <Link href={isSignup ? "/login" : "/signup"}>
                    {isSignup ? "Masuk" : "Daftar"}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Dengan melanjutkan, Anda menyetujui syarat layanan dan kebijakan
        privasi.
      </FieldDescription>
    </div>
  )
}
