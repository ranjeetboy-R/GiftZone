'use client';

import { Show, SignInButton, UserProfile } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function AccountPage() {
  return <>
    <Header />
    <main className="section-pad">
      <div className="container-width">
        <Show when="signed-out">
          <div className="mx-auto max-w-md rounded-xl border p-8 text-center">
            <h1 className="text-2xl font-bold">Your Account</h1>
            <p className="mt-2 text-sm text-slate-500">Login to manage your profile and account settings.</p>
            <SignInButton mode="modal">
              <button className="mt-5 rounded-md bg-[#c92532] px-6 py-3 text-sm font-bold text-white">Login</button>
            </SignInButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserProfile path="/account" routing="path" />
        </Show>
      </div>
    </main>
    <Footer />
  </>;
}
