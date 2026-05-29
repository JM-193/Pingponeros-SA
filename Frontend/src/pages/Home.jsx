import PageLayout from '../components/PageLayout'

export default function Home() {
  return (
    <PageLayout>
      {/* Page title */}
        <h1
          style={{
            fontWeight: 900,
            fontSize: 'clamp(22px, 2.5vw, 34px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
            margin: '0 0 10px',
            color: '#1a1a1a',
          }}
        >
          Vicerrectoría de Administración
        </h1>

        <h2
          style={{
            fontWeight: 800,
            fontSize: 'clamp(14px, 1.8vw, 22px)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            textAlign: 'center',
            margin: '0 0 28px',
            color: '#1a1a1a',
          }}
        >
          La Aplicación de Cargas de Trabajo
        </h2>

        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'justify',
            maxWidth: '820px',
            margin: '0 auto 36px',
            color: '#333',
          }}
        >
          La herramienta para la aplicación de cargas de trabajo, tiene por objetivo recopilar
          información que permita conocer el volumen, distribución y organización del trabajo.
          Sus respuestas verdaderas y precisas servirán de referencia para valorar las necesidades
          planteadas por su Unidad de Trabajo. Las respuestas brindadas serán contrastadas con
          la matriz de procesos de la Unidad respectiva, así como los formularios generales de
          puesto. Se agradece el tiempo y disposición para analizar y responder las preguntas
          que se le indican.
        </p>

        {/* Declaraciones section */}
        <h3
          style={{
            fontWeight: 700,
            fontSize: 'clamp(15px, 1.5vw, 20px)',
            textAlign: 'center',
            margin: '0 0 20px',
            color: '#1a1a1a',
          }}
        >
          Declaraciones Jurada del Puesto de Trabajo
        </h3>

        {/* Historial box */}
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            backgroundColor: '#d9d9d9',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h4
            style={{
              fontWeight: 700,
              fontSize: '15px',
              textAlign: 'center',
              margin: '0 0 18px',
              color: '#1a1a1a',
            }}
          >
            Historial de Declaraciones Juradas
          </h4>

          {/* Declaration cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ textAlign: 'center', color: '#555', fontStyle: 'italic' }}>
              No hay declaraciones juradas guardadas.
            </p>
          </div>
        </div>
    </PageLayout>
  )
}
