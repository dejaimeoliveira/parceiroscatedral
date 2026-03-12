import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function sendWelcomeEmails(nome: string, email: string, telefone: string) {
  // O domínio que você mostrou no print:
  const domain = process.env.MAILGUN_DOMAIN || 'mg.parceiroscatedral.com.br';
  const apiKey = process.env.MAILGUN_API_KEY || '';

  if (!apiKey) {
    console.error('MAILGUN_API_KEY não configurada no .env.local');
    return { success: false, error: 'API KEY missing' };
  }

  const encodedAuth = Buffer.from(`api:${apiKey}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${encodedAuth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const url = `https://api.mailgun.net/v3/${domain}/messages`;

  // Email 1: Para o parceiro
  const textParceiro = `Bem-vindo(a), ${nome}.

Email: ${email}
   
Parabéns, você já pode indicar clientes e aumentar sua renda.

Você poderá indicar, visualizar visualizações e acompanhar seu extrato 
através do aplicativo parceiroscatedral.com.br

Qualquer dúvida entre em contato, ok? (61) 99805-4064 (Dejaime)

Clique aqui e assista a um vídeo de como utilizar nosso aplicativo de parceria:
https://fnowzbxorbkewtcnudhr.supabase.co/storage/v1/object/public/fotos_parceiros/ParceriaCatedral.mp4?t=2024-09-08T20%3A39%3A55.563Z`;

  const htmlParceiro = `<p>Bem-vindo(a), ${nome}.</p>
<p>Email: ${email}</p>
<br/>
<p>Parabéns, você já pode indicar clientes e aumentar sua renda.</p>
<p>Você poderá indicar, visualizar visualizações e acompanhar seu extrato através do aplicativo parceiroscatedral.com.br</p>
<br/>
<p>Qualquer dúvida entre em contato, ok? (61) 99805-4064 (Dejaime)</p>
<p>Clique <a href="https://fnowzbxorbkewtcnudhr.supabase.co/storage/v1/object/public/fotos_parceiros/ParceriaCatedral.mp4?t=2024-09-08T20%3A39%3A55.563Z">aqui</a> e assista a um vídeo de como utilizar nosso aplicativo de parceria.</p>`;

  const formDataParceiro = new URLSearchParams();
  formDataParceiro.append('from', `Parceiros Catedral <mailgun@${domain}>`);
  formDataParceiro.append('to', email);
  formDataParceiro.append('subject', 'Bem-vindo ao Parceiros Catedral');
  formDataParceiro.append('text', textParceiro);
  formDataParceiro.append('html', htmlParceiro);

  // Formatar Telefone e Data
  const digitsPhone = telefone.replace(/\D/g, '');
  let formattedPhone = telefone;
  if (digitsPhone.length === 11) {
    formattedPhone = `(${digitsPhone.substring(0, 2)}) ${digitsPhone.substring(2, 7)}-${digitsPhone.substring(7)}`;
  } else if (digitsPhone.length === 10) {
    formattedPhone = `(${digitsPhone.substring(0, 2)}) ${digitsPhone.substring(2, 6)}-${digitsPhone.substring(6)}`;
  }

  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd/MM/yyyy HH:mm'h'", { locale: ptBR });

  // Email 2: Para o administrador
  const htmlAdmin = `
<p>Nome do Novo Parceiro: <b>${nome}</b></p>
<p>Email: <b>${email}</b></p>
<p>Telefone: <b>${formattedPhone}</b></p>
<p>Email Vendedor: <b>contato@catedralautomacao.com.br</b></p>
<p>Data: <b>${formattedDate}</b></p>
  `;

  const formDataAdmin = new URLSearchParams();
  formDataAdmin.append('from', `Sistema Parceiros <mailgun@${domain}>`);
  formDataAdmin.append('to', 'dejaime.oliveira@gmail.com');
  formDataAdmin.append('subject', `Novo parceiro Catedral: ${email}`);
  formDataAdmin.append('html', htmlAdmin);

  try {
    console.log(`Enviando email de boas-vindas via Mailgun para: ${email} e admin...`);
    const [resParceiro, resAdmin] = await Promise.all([
      fetch(url, { method: 'POST', headers, body: formDataParceiro.toString() }),
      fetch(url, { method: 'POST', headers, body: formDataAdmin.toString() })
    ]);

    let parceiroErrorText = '';
    let adminErrorText = '';

    if (!resParceiro.ok) {
      parceiroErrorText = await resParceiro.text();
      console.error('Falha ao enviar e-mail parceiro (Boas-Vindas). Status:', resParceiro.status, 'Body:', parceiroErrorText);
    }
    if (!resAdmin.ok) {
      adminErrorText = await resAdmin.text();
      console.error('Falha ao enviar e-mail admin (Boas-Vindas). Status:', resAdmin.status, 'Body:', adminErrorText);
    }

    if (!resParceiro.ok || !resAdmin.ok) {
      return { success: false, error: 'Falha no envio da API do Mailgun', detalhes: { parceiro: parceiroErrorText, admin: adminErrorText } }
    }

    console.log('Emails de boas-vindas enviados com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao chamar Mailgun API para boas-vindas:', error);
    return { success: false, error };
  }
}

export async function sendIndicacaoEmails(
  parceiroNome: string,
  parceiroEmail: string,
  empresaIndicada: string,
  contatoIndicado: string,
  telefoneIndicado: string,
  emailIndicado: string
) {
  const domain = process.env.MAILGUN_DOMAIN || 'mg.parceiroscatedral.com.br';
  const apiKey = process.env.MAILGUN_API_KEY || '';

  if (!apiKey) {
    console.error('MAILGUN_API_KEY não configurada no .env.local');
    return { success: false, error: 'API KEY missing' };
  }

  const encodedAuth = Buffer.from(`api:${apiKey}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${encodedAuth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const url = `https://api.mailgun.net/v3/${domain}/messages`;

  // Formatar Telefone
  const digitsPhone = telefoneIndicado.replace(/\D/g, '');
  let formattedPhone = telefoneIndicado;
  // ... omitted for brevity in replace
  if (digitsPhone.length === 11) {
    formattedPhone = `(${digitsPhone.substring(0, 2)}) ${digitsPhone.substring(2, 7)}-${digitsPhone.substring(7)}`;
  } else if (digitsPhone.length === 10) {
    formattedPhone = `(${digitsPhone.substring(0, 2)}) ${digitsPhone.substring(2, 6)}-${digitsPhone.substring(6)}`;
  }

  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd/MM/yyyy HH:mm'h'", { locale: ptBR });

  // Email 1: Para o parceiro
  const textParceiro = `Olá, ${parceiroNome}.

Sua indicação da empresa ${empresaIndicada} foi recebida com sucesso!

Detalhes da Indicação:
Empresa: ${empresaIndicada}
Contato: ${contatoIndicado}
Telefone: ${formattedPhone}
Email: ${emailIndicado}
Data: ${formattedDate}

Acompanhe o status da sua indicação através do aplicativo parceiroscatedral.com.br
Qualquer dúvida entre em contato: (61) 99805-4064 (Dejaime)`;

  const htmlParceiro = `<p>Olá, ${parceiroNome}.</p>
<p>Sua indicação da empresa <b>${empresaIndicada}</b> foi recebida com sucesso!</p>
<br/>
<p><b>Detalhes da Indicação:</b></p>
<p>Empresa: ${empresaIndicada}</p>
<p>Contato: ${contatoIndicado}</p>
<p>Telefone: ${formattedPhone}</p>
<p>Email: ${emailIndicado}</p>
<p>Data: ${formattedDate}</p>
<br/>
<p>Acompanhe o status da sua indicação através do aplicativo parceiroscatedral.com.br</p>
<p>Qualquer dúvida entre em contato: (61) 99805-4064 (Dejaime)</p>`;

  const formDataParceiro = new URLSearchParams();
  formDataParceiro.append('from', `Parceiros Catedral <mailgun@${domain}>`);
  formDataParceiro.append('to', parceiroEmail);
  formDataParceiro.append('subject', 'Indicação Recebida com Sucesso!');
  formDataParceiro.append('text', textParceiro);
  formDataParceiro.append('html', htmlParceiro);

  // Email 2: Para o administrador
  const htmlAdmin = `
<p><b>Nova Indicação de Cliente!</b></p>
<br/>
<p><b>Dados do Parceiro:</b></p>
<p>Nome: ${parceiroNome}</p>
<p>Email: ${parceiroEmail}</p>
<br/>
<p><b>Dados do Lead (Indicação):</b></p>
<p>Empresa: ${empresaIndicada}</p>
<p>Contato: ${contatoIndicado}</p>
<p>Telefone: ${formattedPhone}</p>
<p>Email: ${emailIndicado}</p>
<p>Data: ${formattedDate}</p>
  `;

  const formDataAdmin = new URLSearchParams();
  formDataAdmin.append('from', `Sistema Parceiros <mailgun@${domain}>`);
  formDataAdmin.append('to', 'dejaime.oliveira@gmail.com');
  formDataAdmin.append('subject', `Nova Indicação: ${empresaIndicada} (por ${parceiroNome})`);
  formDataAdmin.append('html', htmlAdmin);

  try {
    console.log(`Enviando email de indicação via Mailgun para: ${parceiroEmail} e admin...`);
    const [resParceiro, resAdmin] = await Promise.all([
      fetch(url, { method: 'POST', headers, body: formDataParceiro.toString() }),
      fetch(url, { method: 'POST', headers, body: formDataAdmin.toString() })
    ]);

    let parceiroErrorText = '';
    let adminErrorText = '';

    if (!resParceiro.ok) {
      parceiroErrorText = await resParceiro.text();
      console.error('Falha ao enviar e-mail parceiro. Status:', resParceiro.status, 'Body:', parceiroErrorText);
    }
    if (!resAdmin.ok) {
      adminErrorText = await resAdmin.text();
      console.error('Falha ao enviar e-mail admin. Status:', resAdmin.status, 'Body:', adminErrorText);
    }

    if (!resParceiro.ok || !resAdmin.ok) {
      return { success: false, error: 'Falha no envio da API do Mailgun', detalhes: { parceiro: parceiroErrorText, admin: adminErrorText } }
    }

    console.log('Emails de indicação enviados com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao chamar Mailgun API para indicação:', error);
    return { success: false, error };
  }
}

