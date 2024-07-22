// page.js
import Image from "next/image";
import Link from "next/link";
import React from "react";
import data from "./founder.json";

function Page() {
  return (
    <main className='m-1 flex flex-col place-items-center h-screen'>
      <Link className='absolute left-24' href='/'>
        {"<-"}
      </Link>
      <h1 className='text-2xl font-bold text-center mb-4'>Founders</h1>
      <div className='flex flex-wrap gap-x-12 gap-y-4 md:gap-x-12 md:gap-y-20 w-full md:w-2/4 justify-center'>
        {data.map((founder) => {
          const [lastName, firstName] = founder.name.split(", ");
          return (
            <Link
              key={founder.id}
              className='flex flex-col place-items-center border-2 hover:shadow-neutral-600 hover:border-neutral-700 transition-all duration-200 border-neutral-800 bg-neutral-900 hover:shadow-xl shadow-md shadow-neutral-700 p-2 rounded-md w-[150px] text-center md:w-[200px]'
              href={`https://x.com/${founder.twitter}`}
            >
              <Image
                src={founder.image}
                alt={founder.name}
                className='rounded-full mb-3'
                width={70}
                height={70}
              />
              <span>
                <strong>{lastName}</strong>
                <br />
                {firstName}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

export default Page;
