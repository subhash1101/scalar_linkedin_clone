import React, { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { postsApi } from '@/services/api'
import CreatePost from '@/components/feed/CreatePost'
import PostCard from '@/components/feed/PostCard'
import LeftSidebar from '@/components/feed/LeftSidebar'
import RightSidebar from '@/components/feed/RightSidebar'
import { PageSpinner } from '@/components/common/Spinner'
import type { Post } from '@/types'

/* fa-solid fa-caret-down */
function CaretDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 320 512" fill="currentColor" style={{ display: 'inline', marginLeft: 2 }}>
      <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9S303 191.9 288 192H32c-15 0-28.2 8.8-33.8 20.8S.2 237.4 9.4 246.6l128 128z"/>
    </svg>
  )
}

type SortMode = 'Top' | 'Recent'

export default function HomePage() {
  const [sort, setSort] = useState<SortMode>('Top')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed', sort],
    queryFn: ({ pageParam = 0 }) => postsApi.getFeed(pageParam as number, 20).then(r => r.data as Post[]),
    getNextPageParam: (lastPage, allPages) => lastPage.length === 20 ? allPages.length * 20 : undefined,
    initialPageParam: 0,
  })

  const posts = data?.pages.flat() || []

  const sortedPosts = sort === 'Top'
    ? [...posts].sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count))
    : posts

  return (
    /* Matches: .main-container { grid-template-columns: 225px 540px 300px; gap: 24px; width: 1128px; margin: 24px auto; } */
    <div style={{
      display: 'grid',
      gridTemplateColumns: '225px 540px 300px',
      gap: 24,
      width: 1128,
      margin: '24px auto',
      alignItems: 'start',
    }}>

      {/* Left sidebar */}
      <aside>
        <LeftSidebar />
      </aside>

      {/* Center feed */}
      <section>
        <CreatePost />

        {/* Sort by line — matches: .sort-by { flex, align-items: center, font-size: 12px } */}
        {!isLoading && sortedPosts.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center',
            fontSize: 12, color: 'rgba(0,0,0,0.6)', marginBottom: 8,
            position: 'relative',
          }}>
            {/* Growing line */}
            <div style={{ flexGrow: 1, height: 1, backgroundColor: '#e0dfdc', marginRight: 8 }} />
            <button
              onClick={() => setShowSortMenu(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'rgba(0,0,0,0.6)', padding: 0,
                display: 'flex', alignItems: 'center',
              }}
            >
              Sort by: <strong style={{ color: 'rgba(0,0,0,0.9)', marginLeft: 4 }}>
                {sort} <CaretDownIcon />
              </strong>
            </button>
            {showSortMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 4,
                background: '#fff', borderRadius: 4,
                boxShadow: '0 0 0 1px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.1)',
                border: '1px solid #e0dfdc', zIndex: 10, minWidth: 100,
              }}>
                {(['Top', 'Recent'] as SortMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setSort(mode); setShowSortMenu(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 16px', fontSize: 14, background: 'none',
                      border: 'none', cursor: 'pointer',
                      fontWeight: sort === mode ? 600 : 400,
                      color: 'rgba(0,0,0,0.9)',
                    }}
                    onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
                    onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <PageSpinner />
        ) : sortedPosts.length === 0 ? (
          <div style={{
            backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e0dfdc',
            padding: 32, textAlign: 'center', color: 'rgba(0,0,0,0.6)',
          }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Your feed is empty</p>
            <p style={{ fontSize: 14 }}>Connect with professionals to see their posts here.</p>
          </div>
        ) : (
          sortedPosts.map(post => <PostCard key={post.id} post={post} />)
        )}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              width: '100%', backgroundColor: '#fff', border: '1px solid #e0dfdc',
              borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 600,
              color: 'rgba(0,0,0,0.6)', cursor: 'pointer', marginBottom: 8,
            }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fff')}
          >
            {isFetchingNextPage ? 'Loading…' : 'Show more posts'}
          </button>
        )}
      </section>

      {/* Right sidebar */}
      <aside>
        <RightSidebar />
      </aside>
    </div>
  )
}
