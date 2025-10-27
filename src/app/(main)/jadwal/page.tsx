import React from 'react';
import { Calendar } from "@/components/modules/components/calendar/calendar";

// Disable caching for this page - always fetch fresh calendar data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JadwalPage = () => {
  return (
    <section className="flex flex-1 w-full p-4">
      <Calendar />
    </section>
  );
}

export default JadwalPage;
