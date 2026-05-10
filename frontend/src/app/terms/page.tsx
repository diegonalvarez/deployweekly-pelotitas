import Link from 'next/link';

export const metadata = { title: 'Términos y condiciones — Pelotitas' };

export default function TermsPage() {
  return (
    <div className="bg-base min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/" className="text-2xs text-text-muted hover:text-text-primary uppercase tracking-widest" style={{ letterSpacing: '0.12em' }}>
          ← Volver
        </Link>
        <h1 className="text-3xl sm:text-display-4 font-bold text-text-primary tracking-tight-2 mt-6 mb-2">
          Términos y condiciones
        </h1>
        <p className="text-2xs text-text-muted">Última actualización: mayo 2026</p>

        <div className="prose prose-invert mt-10 space-y-6 text-text-secondary leading-relaxed text-sm">
          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Aceptación</h2>
            <p>Al usar Pelotitas aceptás estos términos. Si no estás de acuerdo, no uses el servicio.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Quién puede usar el servicio</h2>
            <p>Personas mayores de 13 años. Menores de edad necesitan consentimiento de un tutor.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Conducta</h2>
            <p>Está prohibido suplantar identidades, publicar contenido ofensivo o ilegal, y usar Pelotitas para fines no relacionados con padel, tenis o la comunidad deportiva. Los administradores pueden suspender cuentas que violen estas reglas.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Reservas y torneos</h2>
            <p>Pelotitas conecta jugadores con complejos y organizadores. No somos responsables de la calidad de las canchas, organización de torneos, ni de eventuales daños o lesiones. Cualquier disputa con un complejo o profesor se resuelve directamente con esa parte.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Pagos y suscripciones</h2>
            <p>El plan Pro se cobra en período mensual o anual. Podés cancelarlo en cualquier momento; se mantiene activo hasta el final del período pagado. Reembolsos se evalúan caso por caso.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Limitación de responsabilidad</h2>
            <p>Pelotitas se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida ni que el servicio esté libre de errores. Nuestra responsabilidad máxima por cualquier reclamo se limita al monto de suscripción pagado en los últimos 12 meses.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Cambios</h2>
            <p>Podemos actualizar estos términos. Te avisaremos por email o dentro de la app cuando haya cambios materiales.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República Argentina. Las disputas se resolverán en los tribunales ordinarios de la Ciudad de Buenos Aires.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Contacto</h2>
            <p><a className="text-brand" href="mailto:legal@pelotitas.com">legal@pelotitas.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
