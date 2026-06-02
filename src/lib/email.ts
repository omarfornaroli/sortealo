
/**
 * Servicio para envío de correos utilizando EnvialoSimple API.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.ENVIALOSIMPLE_API_KEY;
  
  if (!apiKey) {
    console.error('ENVIALOSIMPLE_API_KEY no configurada');
    return false;
  }

  try {
    const response = await fetch('https://api.envialosimple.email/v1/context/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'no-reply@sortealo.com.ar',
        to: to,
        subject: subject,
        html: html
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}
