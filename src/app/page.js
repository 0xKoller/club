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
      <footer className='bottom-0 absolute w-full text-center my-1'>
        <Link href='https://github.com/O-n-Club'>GitHub</Link>
      </footer>
    </>
  );
}
