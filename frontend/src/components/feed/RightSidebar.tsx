import React from 'react'

const NEWS = [
  { title: 'Adani Energy announces new ₹3,050-crore solar investment', time: '1d ago', readers: '3,997 readers' },
  { title: 'SpaceX raises $75B in historic initial public offering',    time: '7h ago', readers: '3,232 readers' },
  { title: 'Empowerment gap widens for women in corporate leadership',  time: '4h ago', readers: '1,592 readers' },
  { title: 'Growth stalls for top engineering firms amid talent crunch', time: '4h ago', readers: '1,241 readers' },
  { title: 'New wage rules drive shift to allowances for tech workers',  time: '4h ago', readers: '988 readers' },
]

const PUZZLES = [
  { name: 'Word #4',      connections: 3, bg: '#f8c77e' },
  { name: 'Patches #87',  connections: 4, bg: '#a0c4ff' },
  { name: 'Zip #452',     connections: 4, bg: '#ffadad' },
]

/* fa-solid fa-circle-info */
function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
    </svg>
  )
}
/* fa-solid fa-angle-down */
function AngleDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 448 512" fill="currentColor" style={{ display: 'inline', marginLeft: 4 }}>
      <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
    </svg>
  )
}
/* fa-solid fa-angle-right */
function AngleRightIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 256 512" fill="currentColor">
      <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/>
    </svg>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #e0dfdc',
  marginBottom: 8,
  overflow: 'hidden',
}

const showMoreStyle: React.CSSProperties = {
  color: 'rgba(0,0,0,0.6)',
  fontSize: 14,
  fontWeight: 600,
  padding: '4px 8px',
  borderRadius: 4,
  display: 'inline-block',
  cursor: 'pointer',
  marginTop: 8,
  background: 'none',
  border: 'none',
}

export default function RightSidebar() {
  return (
    <aside>
      {/* LinkedIn News */}
      <div style={cardStyle}>
        <div style={{ padding: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'rgba(0,0,0,0.9)',
          }}>
            <span>LinkedIn News</span>
            <InfoIcon />
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: 0, whiteSpace: 'nowrap' }}>Top stories</h4>

          <ul style={{ marginTop: 12, listStyle: 'none', padding: 0, margin: 0 }}>
            {NEWS.map((item, i) => (
              <li
                key={i}
                style={{
                  marginBottom: 12, paddingLeft: 16, position: 'relative', cursor: 'pointer',
                  color: 'rgba(0,0,0,0.9)',
                }}
                onMouseOver={e => {
                  const title = (e.currentTarget as HTMLElement).querySelector('.news-title') as HTMLElement | null
                  if (title) title.style.textDecoration = 'underline'
                }}
                onMouseOut={e => {
                  const title = (e.currentTarget as HTMLElement).querySelector('.news-title') as HTMLElement | null
                  if (title) title.style.textDecoration = 'none'
                }}
              >
                {/* Bullet via absolute position */}
                <span style={{
                  position: 'absolute', left: 0, color: 'rgba(0,0,0,0.6)',
                  fontSize: 18, lineHeight: '14px', top: 0,
                }}>•</span>
                <div className="news-title" style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>
                  {item.time} • {item.readers}
                </div>
              </li>
            ))}
          </ul>

          <button
            style={showMoreStyle}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            Show more news <AngleDownIcon />
          </button>
        </div>
      </div>

      {/* Today's Puzzles */}
      <div style={cardStyle}>
        <div style={{ padding: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'rgba(0,0,0,0.9)',
          }}>
            <span>Today's puzzles</span>
          </div>

          {PUZZLES.map((puzzle, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', padding: '12px 0',
                borderBottom: i < PUZZLES.length - 1 ? '1px solid #e0dfdc' : 'none',
                cursor: 'pointer',
              }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 4,
                backgroundColor: puzzle.bg, marginRight: 12, flexShrink: 0,
              }} />
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'rgba(0,0,0,0.9)' }}>{puzzle.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>{puzzle.connections} connections played</div>
              </div>
              <AngleRightIcon />
            </div>
          ))}

          <button
            style={{ ...showMoreStyle, marginTop: 0 }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ebebeb')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '')}
          >
            Show more <AngleDownIcon />
          </button>
        </div>
      </div>

      {/* Promoted */}
      <div style={{ ...cardStyle, padding: 0 }}>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', textAlign: 'right', padding: '4px 8px' }}>
          Promoted •••
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ width: 48, height: 48, backgroundColor: '#00a3e0', marginBottom: 8 }} />
          <h4 style={{ fontSize: 14, color: 'rgba(0,0,0,0.9)' }}>aramco</h4>
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', marginTop: 4 }}>
            J Vinay Siva Subhash, get the latest on aramco News, Jobs, and More!
          </p>
        </div>
      </div>
    </aside>
  )
}
