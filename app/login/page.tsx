import { LoginForm } from "@/components/login-form"
import { getSafeCallbackURL } from "@/lib/auth-redirect"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Masjid Jami' Ulul Albab UNNES.",
  robots: { index: false, follow: false },
}

const LOGIN_ERRORS: Record<string, string> = {
  access_denied: "Login Google dibatalkan.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackURL?: string | string[]
    error?: string | string[]
  }>
}) {
  const params = await searchParams
  const error = params.error
  const errorCode = Array.isArray(error) ? error[0] : error
  const callbackURL = getSafeCallbackURL(params.callbackURL)
  const initialError = errorCode
    ? (LOGIN_ERRORS[errorCode.toLowerCase()] ??
      "Login gagal. Silakan coba lagi.")
    : ""

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-3 sm:p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src="/favicon.ico" alt="" width={28} height={28} />
          Masjid Jami&apos; Ulul Albab
        </Link>
        <LoginForm callbackURL={callbackURL} initialError={initialError} />
      </div>
    </div>
  )
}
