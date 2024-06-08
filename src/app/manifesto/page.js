import Link from "next/link";
import React from "react";

function page() {
  return (
    <main className='m-1'>
      <Link href='/'>{"<-"}</Link>
      <h1>Manifiesto del O(n) Club</h1>
      <hr />
      <h2>Introducción</h2>
      <p>
        En un contexto global marcado por el rápido avance de las tecnologías de
        la información, se hace imperativo el establecimiento de plataformas que
        faciliten la colaboración y el intercambio intelectual entre
        profesionales y emprendedores del sector. El O(n) Club se constituye con
        el propósito de reunir a individuos interesados en la exploración y el
        debate sobre el ecosistema tecnológico contemporáneo, promoviendo así la
        innovación y el desarrollo sostenido. Nuestro objetivo es implementar
        siempre tecnología de vanguardia, asegurando que nuestros miembros estén
        a la vanguardia del progreso tecnológico.
      </p>
      <hr />
      <h2>Misión</h2>
      <p>
        La misión del O(n) Club es crear un entorno propicio para la interacción
        y el crecimiento intelectual de sus miembros, facilitando el intercambio
        de conocimientos y experiencias, y promoviendo la creación de nuevas
        oportunidades en el ámbito tecnológico.
      </p>
      <hr />
      <h2>Visión</h2>
      <p>
        El O(n) Club aspira a consolidarse como una comunidad de referencia en
        el ámbito de la tecnología, donde la convergencia de ideas innovadoras
        permita la materialización de proyectos vanguardistas y exitosos.
      </p>
      <hr />
      <h2>Objetivos</h2>
      <ul className='flex flex-col gap-1'>
        <li>
          Fomentar el Networking: Establecer un marco que permita a los miembros
          conectarse, intercambiar experiencias y establecer relaciones
          profesionales valiosas.
        </li>
        <li>
          Promover el Conocimiento: Facilitar el acceso a información
          actualizada y relevante a través de charlas, seminarios y debates de
          alto nivel.
        </li>
        <li>
          Impulsar Proyectos: Brindar apoyo a los miembros en el desarrollo de
          sus iniciativas tecnológicas, proporcionando recursos y mentorías
          especializadas.
        </li>
        <li>
          Incentivar la Innovación: Estimular la creatividad y el desarrollo de
          soluciones innovadoras mediante la organización de desafíos y eventos
          especializados.
        </li>
      </ul>
      <hr />
      <h2>Principios</h2>
      <ul className='flex flex-col gap-1'>
        <li>
          Colaboración: Fomentamos el trabajo en equipo y la sinergia derivada
          del intercambio de conocimientos y experiencias entre los miembros.
        </li>
        <li>
          Inclusión: Valoramos y promovemos la diversidad, asegurando un
          ambiente inclusivo y acogedor para todos los participantes.
        </li>
        <li>
          Transparencia: Defendemos la honestidad y la apertura en todas
          nuestras actividades, decisiones y comunicaciones.
        </li>
        <li>
          Compromiso: Nos comprometemos con la excelencia y el impacto positivo
          de nuestras iniciativas, buscando siempre contribuir al desarrollo del
          ecosistema tecnológico.
        </li>
        <li>
          Confidencialidad: Respetamos la confidencialidad de todas las
          discusiones y contenidos compartidos dentro del club, prohibiendo su
          uso para beneficio propio sin el consentimiento explícito de los
          involucrados.
        </li>
        <li>
          Ambición y Propósito: Los miembros del O(n) Club son personas
          ambiciosas que creen firmemente que donde existe un problema, también
          existen oportunidades. Nos motiva la creación de soluciones por un
          bien mayor, enfocándonos en contribuir positivamente a la sociedad a
          través de la tecnología.
        </li>
        <li>
          Reuniones Anuales: Nos proponemos organizar reuniones anuales en
          diferentes ciudades candidatas, fomentando así el intercambio
          presencial y el fortalecimiento de nuestra comunidad.
        </li>
        <li>
          Admisión Abierta: La aplicación al club estará siempre abierta,
          permitiendo la entrada continua de nuevos miembros interesados en
          nuestros objetivos y principios.
        </li>
        <li>
          Autoridad de los Miembros Fundadores: Los miembros fundadores tendrán
          la potestad de tomar decisiones respecto a la permanencia de los
          miembros en el club, incluyendo la exclusión de aquellos que no
          cumplan con los principios y objetivos establecidos.
        </li>
      </ul>
    </main>
  );
}

export default page;
