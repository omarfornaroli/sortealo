
/**
 * Servicio para envío de correos utilizando EnvialoSimple API.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.ENVIALOSIMPLE_API_KEY;
  
  if (!apiKey) {
    console.warn('ENVIALOSIMPLE_API_KEY no configurada en el entorno.');
    return false;
  }

  try {
    // Usamos el endpoint para envíos de EnvialoSimple
    const response = await fetch('https://api.envialosimple.email/v1/context/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Sortealo <no-reply@sortealo.com.ar>',
        to: to,
        subject: subject,
        html: html
      })
    });

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
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
