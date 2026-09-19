"use client"

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {

    return (
        <div className='w-full h-screen flex items-center justify-center'>
            <SignUp
                routing="path"
                path="/auth/register"
                signInUrl="/auth/login"
                fallbackRedirectUrl='/'
            />
        </div>
    );
}