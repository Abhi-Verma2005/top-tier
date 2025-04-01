import React from 'react'
import { GitGraphIcon, User } from 'lucide-react'

function Input() {
  return (
    <div className='border-[1px] relative rounded-2xl h-24 w-2xl border-[#1d5d7a] flex p-3 flex-col'>
        <input type="text" className='w-full text-2xl text-white/60 placeholder:text-white/60 outline-none focus:ring-0 focus:border-transparent' placeholder='Message M1'/>
        <div className='flex my-5'>
        <GitGraphIcon className='text-white/85 mx-1 size-5'/>
        <User className='text-white/85 mx-1 size-5'/>
        </div>
    </div>
  )
}

export default Input
