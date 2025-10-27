import React from 'react';
import { Calendar } from "@/components/modules/components/calendar/calendar";

// Disable caching for this page - always fetch fresh calendar data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JadwalPage = () => {
  return (
    <section className="w-full h-full p-4 lg:p-6">
      <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-hidden flex flex-col">
        <Calendar />
      </div>
    </section>
  );
}

export default JadwalPage;
