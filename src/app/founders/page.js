import Link from "next/link";
import React from "react";

function page() {
  return (
    <main className='m-1'>
      <Link href='/'>{"<-"}</Link>
      <ul className='flex flex-col gap-1 w-full text-center'>
        <li>
          <Link href='https://x.com/lautidev_'>Acosta, Lautaro</Link>
        </li>
        <li>
          <Link href='https://x.com/GuidooIrigoyen'>Irigoyen, Guido</Link>
        </li>
        <li>
          <Link href='https://x.com/0xKoller'>Koller, Jose Luis</Link>
        </li>
        <li>
          <Link href='https://x.com/software_valen'>Radovich, Valentin</Link>
        </li>
        <li>
          <Link href='https://x.com/vsratti'>Ratti, Valentin </Link>
        </li>
        <li>
          <Link href='https://x.com/alejorrojass'>Rojas, Alejo </Link>
        </li>
        <li>
          <Link href='https://x.com/SantiagoSirvana'>Ruberto, Santiago </Link>
        </li>
        <li>
          <Link href='https://x.com/mateozaratef'>Zarate, Mateo</Link>
        </li>
      </ul>
    </main>
  );
}

export default page;
