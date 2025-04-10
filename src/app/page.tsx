'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const Home = () => {
  const Router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/auth/signin');
    }
  }, [status]);
  return (
    <div>
      Landing Page here
    </div>
  )
}

export default Home
