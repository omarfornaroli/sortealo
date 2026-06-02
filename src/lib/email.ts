
/**
 * Servicio para envío de correos utilizando EnvialoSimple API.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.ENVIALOSIMPLE_API_KEY;
  
  if (!apiKey) {
    console.warn('ENVIALOSIMPLE_API_KEY no configurada. El correo no se enviará realmente.');
    return true; // Retornamos true para no bloquear el flujo en desarrollo si falta la key
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

    const data = await response.json();
    if (!response.ok) {
      console.error('Error API EnvialoSimple:', data);
    }

    return response.ok;
  } catch (error) {
    console.error('Error de red enviando email:', error);
    return false;
  }
}
