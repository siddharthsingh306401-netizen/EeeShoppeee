'use client'
import React, { useState } from 'react'
import { QueryClient , QueryClientProvider} from '@tanstack/react-query';

const providers = ({childern}:{children:React.ReactNode}) => {
    const[quweryClient]= useState(()=> new QueryClient());
  return (
    
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    
  )
}

export default providers