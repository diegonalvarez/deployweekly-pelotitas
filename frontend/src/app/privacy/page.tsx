import Link from 'next/link';

export const metadata = { title: 'Política de privacidad — Pelotitas' };

export default function PrivacyPage() {
  return (
    <div className="bg-base min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/" className="text-2xs text-text-muted hover:text-text-primary uppercase tracking-widest" style={{ letterSpacing: '0.12em' }}>
          ← Volver
        </Link>
        <h1 className="text-3xl sm:text-display-4 font-bold text-text-primary tracking-tight-2 mt-6 mb-2">
          Política de privacidad
        </h1>
        <p className="text-2xs text-text-muted">Última actualización: mayo 2026</p>

        <div className="prose prose-invert mt-10 space-y-6 text-text-secondary leading-relaxed text-sm">
          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Qué información guardamos</h2>
            <p>Para que Pelotitas funcione, almacenamos: email, nombre y apellido, teléfono (formato internacional E.164), ubicación de origen y ubicación actual (sólo si la elegís compartir), historial de partidos y reservas, perfil deportivo (nivel, deportes, mano hábil), conexiones con clubes y otros jugadores.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Ubicación</h2>
            <p>Te pedimos permiso para acceder a la ubicación del dispositivo sólo para mostrarte clubes, torneos y rivales cerca tuyo. Podés elegir compartir la ubicación o ingresarla manualmente. Podés revocar el permiso desde la configuración del sistema operativo en cualquier momento.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Notificaciones push</h2>
            <p>Si activás push, registramos un token de dispositivo (FCM/APNS) asociado a tu cuenta para enviarte avisos de reservas, partidos y torneos. Podés desactivarlas desde la configuración de notificaciones del sistema o desde tu perfil en la app.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Cámara / Fotos</h2>
            <p>Pedimos acceso a la cámara y fotos sólo si elegís subir una imagen de perfil o una foto al feed. Las imágenes se transmiten cifradas y se almacenan en infraestructura de terceros con cifrado en reposo.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Pagos</h2>
            <p>Las suscripciones se procesan vía Stripe. Pelotitas no almacena datos de tarjetas de crédito. Si activás Pelotitas Pro desde una app móvil, el pago puede gestionarse vía la plataforma del sistema operativo (App Store / Play Store) según las reglas de cada tienda.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Quién accede a tus datos</h2>
            <p>Tu perfil deportivo es público por defecto. Los controles de privacidad (plan Pro) permiten ocultar estadísticas, nivel, ciudad, disponibilidad y torneos. Las anotaciones privadas de tu diario y los marcadores de tu anotador personal son visibles sólo para vos. Los administradores de torneos en los que participás ven tu nombre, contacto y resultados oficiales.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Tus derechos</h2>
            <p>Podés ver, exportar, corregir y borrar tus datos personales en cualquier momento desde tu perfil. Para borrado total de cuenta escribinos a <a className="text-brand" href="mailto:privacy@pelotitas.com">privacy@pelotitas.com</a>.</p>
          </section>

          <section>
            <h2 className="text-text-primary text-base font-semibold mb-2">Contacto</h2>
            <p><a className="text-brand" href="mailto:privacy@pelotitas.com">privacy@pelotitas.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
