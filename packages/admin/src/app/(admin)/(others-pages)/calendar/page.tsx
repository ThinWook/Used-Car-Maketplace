import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Calendar | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calendar page for TailAdmin Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function CalendarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">Calendar Component</h3>
          <p className="mb-6 text-center text-gray-500 dark:text-gray-400">
            The calendar component is currently unavailable or has been removed.
          </p>
          <a 
            href="https://fullcalendar.io/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none"
          >
            View Calendar Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
