"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitterName, setSubmitterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Konten feedback tidak boleh kosong");
      return;
    }

    if (content.trim().length < 10) {
      toast.error("Konten feedback minimal 10 karakter");
      return;
    }

    if (!isAnonymous && !submitterName.trim()) {
      toast.error("Nama harus diisi jika tidak memilih anonymous");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          isAnonymous,
          submitterName: isAnonymous ? null : submitterName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim feedback");
      }

      toast.success("Terima kasih atas feedback Anda!", {
        description: "Masukan Anda sangat berharga untuk kami",
      });

      // Reset form
      setContent("");
      setSubmitterName("");
      setIsAnonymous(false);
      setIsSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Submit feedback error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal mengirim feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = 1000 - content.length;

  if (isSuccess) {
    return (
      <div className="w-full h-full p-4 lg:p-6">
        <div className="w-full h-full max-w-[1400px] mx-auto flex items-center justify-center">
          <Card className="w-full max-w-2xl border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">
                Feedback Terkirim!
              </h2>
              <p className="text-green-700 dark:text-green-300 text-center">
                Terima kasih atas masukan Anda. Kami akan segera meninjaunya.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 lg:p-6">
      <div className="w-full h-full max-w-[1400px] mx-auto lg:flex lg:items-center lg:justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Saran & Kritik</CardTitle>
                <CardDescription className="text-base mt-1">
                  Bantu kami meningkatkan layanan dengan memberikan masukan Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous" className="text-base font-medium">
                    Kirim sebagai Anonymous
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Identitas Anda tidak akan ditampilkan
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              {/* Name Input (only if not anonymous) */}
              {!isAnonymous && (
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama Anda <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama Anda"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    maxLength={100}
                    className="text-base"
                  />
                </div>
              )}

              {/* Feedback Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Saran, Kritik, atau Masukan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Tuliskan saran, kritik, atau masukan Anda di sini... (minimal 10 karakter)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  maxLength={1000}
                  className="resize-none text-base"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimal 10 karakter</span>
                  <span className={remainingChars < 100 ? "text-orange-500 font-medium" : ""}>
                    {remainingChars} karakter tersisa
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || content.trim().length < 10 || (!isAnonymous && !submitterName.trim())}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
