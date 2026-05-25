/** Static WhatsApp chat mockup. Pure SVG/HTML, no client JS needed. */
export default function WhatsAppMockup() {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 360 }}>
      {/* Phone frame */}
      <div
        className="rounded-[40px] p-2.5 shadow-2xl"
        style={{ background: '#1a1208' }}
      >
        {/* Screen */}
        <div
          className="rounded-[32px] overflow-hidden"
          style={{ background: '#0a0a0a' }}
        >
          {/* WA header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: '#075E54', color: '#fff' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base"
              style={{ background: '#25D366', color: '#fff' }}
            >
              🎾
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-tight">Pelotitas · Club Norte</p>
              <p className="text-[10px] opacity-80 leading-tight mt-0.5">en línea</p>
            </div>
          </div>

          {/* Chat background */}
          <div
            className="px-3 py-4 space-y-2.5"
            style={{
              background:
                'linear-gradient(180deg, #1F1A14 0%, #15110C 100%)',
              minHeight: 480,
            }}
          >
            {/* Date chip */}
            <div className="flex justify-center mb-2">
              <span
                className="inline-block px-3 py-1 rounded-md text-[10px] font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
              >
                HOY
              </span>
            </div>

            {/* Message 1 — reservation confirmation */}
            <ChatBubble
              accent="#25D366"
              caption="✅ Reserva confirmada"
              body="Hola Diego 👋 Tu reserva en Club Norte está confirmada para hoy 19:00 — Cancha 3 (Padel). ¡Te esperamos!"
              time="08:32"
            />

            {/* Message 2 — reminder */}
            <ChatBubble
              accent="#FFD23F"
              caption="⏰ Recordatorio · 2hs antes"
              body="Diego, jugás en 2hs. Si no podés ir, cancelá ahora desde la app y liberá la cancha 🙏"
              time="17:00"
            />

            {/* Message 3 — who won */}
            <ChatBubble
              accent="#FF7A3D"
              caption="🏆 ¿Quién ganó?"
              body="Partido terminado. Cargá el score y suma puntos al ranking 👇  Diego/Carlos vs Pedro/Juan"
              time="20:45"
            />

            {/* Message 4 — broadcast */}
            <ChatBubble
              accent="#2A6BB0"
              caption="📣 Anuncio del club"
              body="Nuevo torneo este finde — 16 parejas, premio para el campeón. Anotate antes del viernes 🏆"
              time="21:10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  accent,
  caption,
  body,
  time,
}: {
  accent: string;
  caption: string;
  body: string;
  time: string;
}) {
  return (
    <div
      className="rounded-2xl rounded-tl-sm p-3 max-w-[92%]"
      style={{ background: '#1F2C34', color: '#E6EAEA' }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
        style={{ color: accent }}
      >
        {caption}
      </p>
      <p className="text-[12.5px] leading-snug">{body}</p>
      <p className="text-[9px] text-right mt-1 opacity-60">{time}</p>
    </div>
  );
}
