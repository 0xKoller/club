// page.js
import React from "react";
import data from "./member.json";
import Link from "next/link";

function Page() {
  const quantity = data.length;
  return (
    <main className='flex flex-col place-items-center m-1 p-2'>
      <Link className='absolute left-24' href='/'>
        {"<-"}
      </Link>
      <h1 className='text-2xl font-bold text-center mb-2'>Members</h1>
      <div className='md:w-2/3 p-2'>
        <div className='grid gap-2 md:grid-cols-2 mb-2'>
          <p>
            En esta sección se encuentran los miembros del O(n) Club, quienes
            contribuyen con su experiencia y conocimientos al mismo. Si deseas
            contactar a alguno de ellos, puedes hacerlo a través de sus redes
            sociales.
          </p>
          <div className='hidden text-center md:flex flex-col place-items-center gap-2'>
            <p>Si deseas unirte al club, puedes hacerlo haciendo click</p>
            <Link
              className='text-neutral-800 pointer-events-none flex flex-col place-items-center border-2 hover:shadow-neutral-600 hover:border-neutral-700 transition-all duration-200 border-neutral-800 bg-neutral-900 hover:shadow-xl shadow-md shadow-neutral-700 p-2 rounded-md w-[150px] text-center md:w-[200px]'
              href='google.com'
            >
              Unirse a O(n) Club
            </Link>
          </div>
        </div>
        <p className='text-center md:text-end me-1 mb-2'>
          Cantidad de miembros: {quantity}/20{" "}
        </p>

        <div className='flex flex-wrap gap-2  justify-evenly '>
          {data.map((member) => {
            const [lastName, firstName] = member.name.split(", ");
            return (
              <Link
                href={"https://x.com/" + member.twitter}
                key={member.name}
                className='flex flex-col place-items-center border-2 hover:shadow-neutral-600 hover:border-neutral-700 transition-all duration-200 border-neutral-800 bg-neutral-900 hover:shadow-xl shadow-md shadow-neutral-700 p-2 rounded-md w-[150px] text-center md:w-[200px]'
              >
                <span>
                  <strong>{lastName}</strong>
                  <br />
                  {firstName}
                </span>
              </Link>
            );
          })}
        </div>
        <div className='flex text-center md:hidden flex-col place-items-center gap-2 mt-8'>
          <p>Si deseas unirte al club, puedes hacerlo haciendo click</p>
          <Link
            className='flex flex-col place-items-center border-2 hover:shadow-neutral-600 hover:border-neutral-700 transition-all duration-200 border-neutral-800 bg-neutral-900 hover:shadow-xl shadow-md shadow-neutral-700 p-2 rounded-md w-[150px] text-center md:w-[200px]'
            href='google.com'
          >
            Unirse a O(n) Club
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Page;
