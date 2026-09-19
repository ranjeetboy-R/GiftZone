"use client"

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {

    return (
        <div className='w-full h-screen flex items-center justify-center'>
            <SignIn
                routing="path"
                path="/auth/login"
                signUpUrl="/auth/register"
                fallbackRedirectUrl='/'
            />
        </div>
    );
}