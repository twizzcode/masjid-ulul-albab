"use client";

import { BookingOnboarding } from "@/components/onboarding";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PinjamPage() {
  const router = useRouter();

  const handleComplete = (data: any) => {
    console.log("Booking data:", data);
    // TODO: Send data to API
    // After successful submission, redirect to jadwal page
    router.push("/jadwal");
  };

  return (
    <motion.div 
      className="w-full h-full flex items-start justify-center p-4 overflow-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full">
        <BookingOnboarding onComplete={handleComplete} />
      </div>
    </motion.div>
  );
}
