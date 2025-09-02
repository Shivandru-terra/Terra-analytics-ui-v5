import React from 'react'
import { Skeleton } from './skeleton'

const ThreadSkeleton = () => {
  return (
    <div className="p-3 mb-2 rounded-lg bg-accent/20 animate-pulse">
    <Skeleton className="h-4 w-2/3 mb-2" />
    <div className="flex justify-between text-xs">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
  )
}

export default ThreadSkeleton