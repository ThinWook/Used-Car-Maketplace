"use client";
import SignInForm from "@/components/auth/SignInForm";
import React from "react";

export default function SignIn() {
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full px-4 sm:px-0">
      <div className="flex justify-center items-center flex-col">
        <SignInForm />
      </div>
    </div>
  );
}
