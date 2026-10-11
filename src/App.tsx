import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { ApiStatus } from './ApiStatus.tsx'
import { ExternalLink } from './security/ExternalLink.tsx'
import { Support } from './Support.tsx'

type Page = 'home' | 'support'

function pageFromHash(): Page {
  return window.location.hash === '#/support' ? 'support' : 'home'
}

function App() {
  const [count, setCount] = useState(0)
  const [page, setPage] = useState<Page>(pageFromHash)

  useEffect(() => {
    const onHashChange = () => {
      setPage(pageFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  const goTo = (next: Page) => {
    const hash = next === 'support' ? '#/support' : '#/'
    if (window.location.hash === hash) {
      setPage(next)
      return
    }
    window.location.hash = hash
  }

  return (
    <>
      <nav className="site-nav" aria-label="Primary">
        <button
          type="button"
          aria-current={page === 'home' ? 'page' : undefined}
          onClick={() => {
            goTo('home')
          }}
        >
          Home
        </button>
        <button
          type="button"
          aria-current={page === 'support' ? 'page' : undefined}
          onClick={() => {
            goTo('support')
          }}
        >
          Support
        </button>
      </nav>

      {page === 'support' ? (
        <Support />
      ) : (
        <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <ApiStatus />
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <ExternalLink href="https://vite.dev/">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://react.dev/">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </ExternalLink>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <ExternalLink href="https://github.com/vitejs/vite">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://chat.vite.dev/">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://x.com/vite_js">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://bsky.app/profile/vite.dev">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </ExternalLink>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
        </>
      )}
    </>
  )
}

export default App
