import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className='flex flex-col justify-between place-content-center w-full  text-center'>
        <section className='m-4'>
          <h1 className='text-2xl'>O(n) Club</h1>
          <h2 className='italic text-lg'>
            "Como Argentinos no tenemos que mirar afuera para buscar referentes"
          </h2>
        </section>
        <section>
          <nav className='flex flex-col'>
            <Link href='/manifesto'>Manifesto</Link>
            <Link href='/founders'>Founders</Link>
            <Link
              href='/members'
              className='pointer-events-none text-neutral-700'
            >
              Members
            </Link>
            <Link
              href='/terminal'
              className='pointer-events-none text-neutral-700'
            >
              Terminal
            </Link>
          </nav>
        </section>
      </main>
      <footer className='bottom-0 absolute w-full text-center my-1 flex justify-center gap-4 mb-4'>
        <Link href='https://github.com/O-n-Club'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='currentColor'
            class='bi bi-github'
            viewBox='0 0 16 16'
          >
            <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8' />
          </svg>
        </Link>
        <Link href='https://open.spotify.com/playlist/1cBzbJKD89F4N9AyMEQ2y3?si=515c648aa8c44a76'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            fill='currentColor'
            class='bi bi-spotify'
            viewBox='0 0 16 16'
          >
            <path d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288' />
          </svg>
        </Link>
      </footer>
    </>
  );
}
