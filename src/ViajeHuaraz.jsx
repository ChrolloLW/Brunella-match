import React, { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

// Rutas de imágenes y música
const BUS_IMG = "/images/bus_nocturno.png";
const LAGUNA_IMG = "/images/laguna_dia.png";

export default function ViajeHuaraz({
  nextPath = "recuerdo-especial", // siguiente escena
  audioSrc = "/audio/wind_and_rain.mp3",
  onDone,
}) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState(false);

  // Secuencia automática de escenas
  useEffect(() => {
    const timers = [];

    timers.push(setTimeout(() => setFade(true), 5000)); // transición
    timers.push(setTimeout(() => { setStep(2); setFade(false); }, 7000));
    timers.push(setTimeout(() => setFade(true), 14000));
    timers.push(setTimeout(() => { setStep(3); setFade(false); }, 16000));
    timers.push(setTimeout(() => {
      if (typeof onDone === "function") onDone();
      else window.location.assign(nextPath);
    }, 26000));

    return () => timers.forEach(clearTimeout);
  }, [onDone, nextPath]);

  const escenas = [
    {
      id: 1,
      fondo: BUS_IMG,
      texto:
        "Tras llegar a diferentes horas, y como era habitual en mí, un poco tarde, finalmente partimos rumbo a Huaraz. En el camino conversábamos sobre todo lo que queríamos hacer, mientras tomaba tu mano y te robaba algunos besos entre risas.",
    },
    {
      id: 2,
      fondo: LAGUNA_IMG,
      texto:
        "Al llegar, el día fue tranquilo, pero la caminata en la laguna fue el verdadero desafío. Mientras conversábamos y seguíamos el sendero, me advertías que el viaje era solo de amigos, y yo, sin ningún problema, te respondía que no había problema.",
    },
    {
      id: 3,
      fondo: LAGUNA_IMG,
      texto:
        "Al comenzar la lluvia empezaste a temblar, y me preocupé. Volvimos rápido al carro; con un fuerte abrazo y mi casaca intenté darte calor para pasar el mal rato. En ese instante, nada más importaba que tu bienestar. Fue ahí cuando me di cuenta de que quería algo más que solo una amistad.",
    },
  ];

  const escena = escenas.find((e) => e.id === step);

  return (
    <div className="w-full h-screen overflow-hidden relative bg-black flex items-center justify-center">
      <audio src={audioSrc} autoPlay loop volume={0.3}></audio>

      <AnimatePresence mode="wait">
        <Motion.div
          key={escena.id}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: fade ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <img
            src={escena.fondo}
            alt="escena"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 🌧️ Efecto de lluvia mejorado SOLO en la escena 3 */}
          {step === 3 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(120)].map((_, i) => (
                <Motion.div
                  key={i}
                  className="absolute bg-white/70 rounded-full blur-[1px]"
                  style={{
                    width: 2,
                    height: 14,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: ["0%", "130%"],
                    x: ["0%", "2%"], // pequeño viento diagonal
                    opacity: [1, 0.3],
                  }}
                  transition={{
                    duration: 0.6 + Math.random() * 0.7,
                    repeat: Infinity,
                    delay: Math.random() * 1.5,
                    ease: "easeIn",
                  }}
                />
              ))}
            </div>
          )}

          {/* Texto narrativo */}
          <Motion.div
            className="absolute bottom-10 w-11/12 bg-black/60 text-white p-6 rounded-2xl text-center mx-auto font-medium text-lg leading-relaxed shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            {escena.texto}
          </Motion.div>
        </Motion.div>
      </AnimatePresence>

      {/* Botón Saltar */}
      <button
        onClick={() =>
          typeof onDone === "function"
            ? onDone()
            : window.location.assign(nextPath)
        }
        className="absolute top-5 right-5 px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-lg z-50"
      >
        Saltar
      </button>
    </div>
  );
}
