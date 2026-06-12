import React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { postsApi } from '@/services/api'
import CreatePost from '@/components/feed/CreatePost'
import PostCard from '@/components/feed/PostCard'
import LeftSidebar from '@/components/feed/LeftSidebar'
import RightSidebar from '@/components/feed/RightSidebar'
import { PageSpinner } from '@/components/common/Spinner'
import type { Post } from '@/types'

export default function HomePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => postsApi.getFeed(pageParam as number, 20).then(r => r.data as Post[]),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 20 ? allPages.length * 20 : undefined,
    initialPageParam: 0,
  })

  const posts = data?.pages.flat() || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,240px)_minmax(0,560px)_minmax(0,320px)] gap-5">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-[72px]">
            <LeftSidebar />
          </div>
        </div>

        {/* Feed */}
        <main className="space-y-3 min-w-0">
          <CreatePost />
          {isLoading ? (
            <PageSpinner />
          ) : posts.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <p className="text-lg font-medium mb-1">Your feed is empty</p>
              <p className="text-sm">Connect with professionals to see their posts here.</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full card py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {isFetchingNextPage ? 'Loading…' : 'Show more posts'}
            </button>
          )}
        </main>

        {/* Right Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-[72px]">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
