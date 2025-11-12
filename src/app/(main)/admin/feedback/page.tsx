"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import {
  MessageSquare,
  Loader2,
  UserCircle2,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface Feedback {
  id: string;
  content: string;
  submitterName: string | null;
  isAnonymous: boolean;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [monthFilter, setMonthFilter] = useState<string>("all"); // Format: YYYY-MM or "all"
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  // Redirect non-admin users
  useEffect(() => {
    if (!userLoading && user) {
      if (user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchFeedbacks();
    }
  }, [user, filter, monthFilter]);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ filter });
      if (monthFilter !== "all") {
        params.append("month", monthFilter);
      }
      const response = await fetch(`/api/admin/feedback?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks);
    } catch (error) {
      console.error("Fetch feedbacks error:", error);
      toast.error("Gagal memuat feedback");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate month options (last 6 months + current)
  const getMonthOptions = () => {
    const options = [{ value: "all", label: "Semua Bulan" }];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = subMonths(now, i);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy", { locale: id });
      options.push({ value, label });
    }
    
    return options;
  };

  const handleToggleRead = async (feedback: Feedback) => {
    try {
      setProcessingId(feedback.id);
      const response = await fetch(`/api/admin/feedback/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !feedback.isRead }),
      });

      if (!response.ok) throw new Error("Failed to update feedback");

      toast.success(
        feedback.isRead ? "Ditandai belum dibaca" : "Ditandai sudah dibaca"
      );
      await fetchFeedbacks();
    } catch (error) {
      console.error("Update feedback error:", error);
      toast.error("Gagal mengupdate feedback");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedFeedback) return;

    try {
      setProcessingId(selectedFeedback.id);
      const response = await fetch(`/api/admin/feedback/${selectedFeedback.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete feedback");

      toast.success("Feedback berhasil dihapus");
      setShowDeleteDialog(false);
      setSelectedFeedback(null);
      await fetchFeedbacks();
    } catch (error) {
      console.error("Delete feedback error:", error);
      toast.error("Gagal menghapus feedback");
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailDialog = async (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailDialog(true);

    // Mark as read if not already
    if (!feedback.isRead) {
      try {
        await fetch(`/api/admin/feedback/${feedback.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        await fetchFeedbacks();
      } catch (error) {
        console.error("Auto mark as read error:", error);
      }
    }
  };

  const openDeleteDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setShowDeleteDialog(true);
  };

  const getUnreadCount = () => feedbacks.filter((f) => !f.isRead).length;

  const renderFeedbackCard = (feedback: Feedback) => (
    <Card
      key={feedback.id}
      className={`hover:shadow-md transition-all cursor-pointer ${
        !feedback.isRead ? "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
      onClick={() => openDetailDialog(feedback)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {feedback.isAnonymous ? (
                <UserCircle2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <MessageSquare className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {feedback.isAnonymous
                  ? "Anonymous"
                  : feedback.submitterName || feedback.user?.name || "Unknown"}
              </p>
              {!feedback.isAnonymous && feedback.user?.email && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {feedback.user.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!feedback.isRead && (
              <Badge variant="default" className="bg-blue-600">
                Baru
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-3">{feedback.content}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(feedback.createdAt), "dd MMM yyyy, HH:mm", {
              locale: id,
            })}
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => handleToggleRead(feedback)}
              disabled={processingId === feedback.id}
            >
              {feedback.isRead ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => openDeleteDialog(feedback)}
              disabled={processingId === feedback.id}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Show loading screen while verifying admin access
  if (userLoading) {
    return (
      <div className="w-full h-full p-4 lg:p-6">
        <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
          <div className="p-6 flex items-center justify-center h-full">
            <LoadingScreen message="Memverifikasi akses admin..." />
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <>
      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Detail Feedback
            </DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedFeedback.isAnonymous
                      ? "Anonymous"
                      : selectedFeedback.submitterName ||
                        selectedFeedback.user?.name ||
                        "Unknown"}
                  </span>
                </div>
                {!selectedFeedback.isAnonymous && selectedFeedback.user?.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {selectedFeedback.user.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(
                    new Date(selectedFeedback.createdAt),
                    "dd MMMM yyyy, HH:mm",
                    { locale: id }
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Konten Feedback:</Label>
                <div className="p-4 rounded-lg border bg-background whitespace-pre-wrap">
                  {selectedFeedback.content}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Feedback</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus feedback ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedFeedback(null);
              }}
              disabled={processingId !== null}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={processingId !== null}
            >
              {processingId !== null ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="w-full h-full p-4 lg:p-6">
        <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl flex flex-col overflow-hidden">
          {/* Admin Navigation Header */}
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </div>
            
            <h1 className="text-2xl font-bold mb-1">Feedback & Masukan</h1>
            <p className="text-sm text-muted-foreground">
              Kelola saran, kritik, dan masukan dari pengguna
            </p>
          </div>

          {/* Header Section - Fixed */}
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
              {getUnreadCount() > 0 && (
                <Badge variant="default" className="bg-blue-600 text-base px-3 py-1">
                  {getUnreadCount()} Belum Dibaca
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Feedback</SelectItem>
                  <SelectItem value="unread">Belum Dibaca</SelectItem>
                  <SelectItem value="read">Sudah Dibaca</SelectItem>
                </SelectContent>
              </Select>

              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-slate-600">Memuat feedback...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">Belum Ada Feedback</p>
                  <p className="text-sm text-muted-foreground text-center">
                    {filter === "all"
                      ? "Belum ada feedback yang masuk"
                      : filter === "unread"
                      ? "Tidak ada feedback yang belum dibaca"
                      : "Tidak ada feedback yang sudah dibaca"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feedbacks.map(renderFeedbackCard)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
