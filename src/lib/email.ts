
/**
 * Servicio para envío de correos utilizando EnvialoSimple API.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.ENVIALOSIMPLE_API_KEY;
  
  if (!apiKey) {
    console.warn('ENVIALOSIMPLE_API_KEY no configurada en el entorno.');
    return false;
  }

  const payload = {
    from: 'support@posify.website',
    to: to,
    subject: subject,
    html: html
  };

  // Log del contenido completo para depuración
  console.log('--- INTENTO DE ENVÍO DE EMAIL ---');
  console.log('Destinatario:', to);
  console.log('Asunto:', subject);
  console.log('Cuerpo HTML completo:', html);
  console.log('---------------------------------');

  try {
    const response = await fetch('https://api.envialosimple.email/api/v1/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const rawResponse = await response.text();
    console.log(`EnvialoSimple API Response Raw (Status: ${response.status}):`, rawResponse);

    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      responseData = rawResponse;
    }
    
    if (!response.ok) {
      console.error('Error detectado en EnvialoSimple API:', {
        status: response.status,
        statusText: response.statusText,
        detail: responseData
      });
      return false;
    }

    console.log('Email enviado exitosamente a:', to);
    return true;
  } catch (error) {
    console.error('Error crítico de red o ejecución al enviar email:', error);
    return false;
  }
}
