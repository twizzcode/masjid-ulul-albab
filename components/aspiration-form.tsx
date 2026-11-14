"use client"

import { useState, type FormEvent } from "react"
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
  SentIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type SubmitState = "idle" | "submitting" | "success" | "error"

export function AspirationForm() {
  const [anonymous, setAnonymous] = useState(true)
  const [messageLength, setMessageLength] = useState(0)
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState("submitting")
    setErrorMessage("")

    const form = event.currentTarget
    const data = new FormData(form)

    try {
      const response = await fetch("/api/aspirasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous,
          message: data.get("message"),
          name: data.get("name"),
          website: data.get("website"),
        }),
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(result.message || "Aspirasi belum dapat dikirim.")
      }

      form.reset()
      setAnonymous(true)
      setMessageLength(0)
      setSubmitState("success")
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Aspirasi belum dapat dikirim."
      )
      setSubmitState("error")
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Kotak Aspirasi</CardTitle>
        <CardDescription>
          Sampaikan saran, kritik, atau masukan untuk Masjid Jami&apos; Ulul
          Albab.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="anonymous">Kirim secara anonim</FieldLabel>
                <FieldDescription>
                  Nama Anda tidak akan disimpan bersama aspirasi.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="anonymous"
                checked={anonymous}
                onCheckedChange={setAnonymous}
                aria-label="Kirim secara anonim"
              />
            </Field>

            {!anonymous && (
              <Field>
                <FieldLabel htmlFor="name">Nama</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Masukkan nama Anda"
                />
              </Field>
            )}

            <Field>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="message">Aspirasi</FieldLabel>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {messageLength}/2.000
                </span>
              </div>
              <Textarea
                id="message"
                name="message"
                minLength={10}
                maxLength={2000}
                required
                aria-describedby="message-description"
                placeholder="Tuliskan saran, kritik, atau masukan Anda..."
                className="max-h-80 min-h-32"
                onChange={(event) =>
                  setMessageLength(event.target.value.length)
                }
              />
              <FieldDescription id="message-description">
                Gunakan bahasa yang sopan dan jelaskan dengan cukup rinci.
              </FieldDescription>
            </Field>

            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
          </FieldGroup>

          <div aria-live="polite">
            {submitState === "success" && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-foreground"
                />
                <p>
                  Aspirasi berhasil dikirim. Terima kasih atas kepedulian Anda.
                </p>
              </div>
            )}
            {submitState === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitState === "submitting"}
            aria-live="polite"
            className="bg-gradient-to-b from-blue-500 to-blue-700 font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:from-blue-500 hover:to-blue-800"
          >
            <HugeiconsIcon
              icon={submitState === "submitting" ? Loading03Icon : SentIcon}
              strokeWidth={2}
              aria-hidden="true"
              className={
                submitState === "submitting"
                  ? "animate-spin motion-reduce:animate-pulse"
                  : undefined
              }
            />
            {submitState === "submitting" ? "Mengirim..." : "Kirim aspirasi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
