import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src="/favicon.ico" alt="" width={28} height={28} />
          Masjid Jami&apos; Ulul Albab
        </Link>
        <LoginForm mode="signup" />
      </div>
    </div>
  )
}
