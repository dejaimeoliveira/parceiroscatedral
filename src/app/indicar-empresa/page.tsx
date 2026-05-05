'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

// ─── tipos ────────────────────────────────────────────────────────────────────

interface Parceiro {
  id: number
  uid: string
  email: string
  email_vendedor: string | null
  token_indicacao: string
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function dataHoje() {
  return new Date().toISOString().split('T')[0]
}

function dataLimite() {
  const d = new Date()
  d.setDate(d.getDate() + 180)
  return d.toISOString().split('T')[0]
}

function maskCnpj(v: string) {
  v = v.replace(/\D/g, '').substring(0, 14)
  v = v.replace(/^(\d{2})(\d)/, '$1.$2')
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
  v = v.replace(/(\d{4})(\d)/, '$1-$2')
  return v
}

function maskTelefone(v: string) {
  v = v.replace(/\D/g, '').substring(0, 11)
  if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

function validarCnpj(c: string) {
  c = c.replace(/\D/g, '')
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false
  let t = c.length - 2, d = c.substring(0, t), g = c.substring(t), s = 0, p = t - 7
  for (let i = t; i >= 1; i--) { s += Number(d.charAt(t - i)) * p--; if (p < 2) p = 9 }
  let r = s % 11 < 2 ? 0 : 11 - (s % 11)
  if (r !== Number(g.charAt(0))) return false
  t++; d = c.substring(0, t); s = 0; p = t - 7
  for (let i = t; i >= 1; i--) { s += Number(d.charAt(t - i)) * p--; if (p < 2) p = 9 }
  r = s % 11 < 2 ? 0 : 11 - (s % 11)
  return r === Number(g.charAt(1))
}

// ─── componente ───────────────────────────────────────────────────────────────

export default function IndicarEmpresaPage() {

  const [token, setToken] = useState<string | null>(null)
  const [parceiro, setParceiro] = useState<Parceiro | null>(null)
  const [linkStatus, setLinkStatus] = useState<'carregando' | 'valido' | 'invalido'>('carregando')

  const [nomeContato, setNomeContato] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [observacao, setObservacao] = useState('')

  const [erros, setErros] = useState<Record<string, string>>({})
  const [gravando, setGravando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroGeral, setErroGeral] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    setToken(t)

    if (!t) { setLinkStatus('invalido'); return }

    getSupabase()
      .from('parceiros')
      .select('id, uid, email, email_vendedor, token_indicacao')
      .eq('token_indicacao', t)
      .maybeSingle()
      .then(({ data, error }) => {
        console.log('PARCEIRO DATA:', JSON.stringify(data, null, 2))
        console.log('PARCEIRO ERROR:', JSON.stringify(error, null, 2))
        if (error || !data) { setLinkStatus('invalido'); return }
        setParceiro(data as Parceiro)
        setLinkStatus('valido')
      })
  }, [])

  async function handleGravar() {
    const novosErros: Record<string, string> = {}
    if (!nomeContato.trim()) novosErros.nomeContato = 'Informe o nome do contato.'
    if (!empresa.trim()) novosErros.empresa = 'Informe o nome da empresa.'
    if (!validarCnpj(cnpj)) novosErros.cnpj = 'CNPJ inválido.'
    if (email && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) novosErros.email = 'E-mail inválido.'

    if (Object.keys(novosErros).length > 0) { setErros(novosErros); return }

    setGravando(true)
    setErroGeral('')

    const payload = {
      uid_parceiro: parceiro?.uid ?? null,
      email_parceiro: parceiro?.email ?? null,
      email_vendedor: parceiro?.email_vendedor ?? null,
      nome_contato: nomeContato.trim(),
      empresa: empresa.trim(),
      cnpj: cnpj.replace(/\D/g, ''),
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      observacao: observacao.trim() || null,
      data_indicacao: dataHoje(),
      data_limite: dataLimite(),
      data_exclusao: null,
      data_venda: null,
      origem: 'link',
      token_indicacao: token,
    }

    const { data, error } = await getSupabase().from('indicacoes').insert(payload).select()
    console.log('PAYLOAD:', JSON.stringify(payload, null, 2))
    console.log('RETORNO:', JSON.stringify(data, null, 2))
    console.log('ERRO:', JSON.stringify(error, null, 2))

    setGravando(false)

    if (!error) {
      setSucesso(true)
      return
    }

    if (error.code === '23505') {
      setErros({ cnpj: 'Este CNPJ já foi indicado anteriormente.' })
    } else {
      setErroGeral('Ocorreu um erro ao salvar. Tente novamente.')
      console.error(error)
    }
  }

  // ─── tela de carregando ───────────────────────────────────────────────────

  if (linkStatus === 'carregando') {
    return (
      <div style={styles.pageCenter}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // ─── tela de link inválido ────────────────────────────────────────────────

  if (linkStatus === 'invalido') {
    return (
      <div style={styles.pageCenter}>
        <div style={styles.card}>
          <div style={{ ...styles.iconCircle, background: '#fee2e2' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={styles.heading}>Link inválido</h2>
          <p style={styles.subtext}>
            Este link de indicação é inválido ou expirou.<br />
            Por favor, solicite um novo link ao seu parceiro.
          </p>
        </div>
      </div>
    )
  }

  // ─── tela de sucesso ──────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <div style={styles.pageCenter}>
        <div style={styles.card}>
          <div style={{ ...styles.iconCircle, background: '#fef3c7' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#F5A623" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={styles.heading}>Sucesso. Cadastro Realizado.</h2>
          <p style={styles.subtext}>Em breve entraremos em contato.</p>
        </div>
      </div>
    )
  }

  // ─── formulário ──────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Indicar Minha Empresa</h1>
      </div>

      <div style={styles.body}>

        <div style={styles.bannerParceiro}>
          Você está preenchendo este formulário como indicação do nosso parceiro.
        </div>

        {erroGeral && <div style={styles.bannerErro}>{erroGeral}</div>}

        <Field label="Nome do contato" error={erros.nomeContato}>
          <input
            style={{ ...styles.input, ...(erros.nomeContato ? styles.inputError : {}) }}
            placeholder="Seu nome completo"
            maxLength={60}
            value={nomeContato}
            onChange={e => { setNomeContato(e.target.value); setErros(p => ({ ...p, nomeContato: '' })) }}
          />
          <Counter value={nomeContato} max={60} />
        </Field>

        <Field label="Nome da empresa" error={erros.empresa}>
          <input
            style={{ ...styles.input, ...(erros.empresa ? styles.inputError : {}) }}
            placeholder="Razão social ou nome fantasia"
            maxLength={60}
            value={empresa}
            onChange={e => { setEmpresa(e.target.value); setErros(p => ({ ...p, empresa: '' })) }}
          />
          <Counter value={empresa} max={60} />
        </Field>

        <Field label="CNPJ" error={erros.cnpj}>
          <input
            style={{ ...styles.input, ...(erros.cnpj ? styles.inputError : {}) }}
            placeholder="00.000.000/0000-00"
            maxLength={18}
            value={cnpj}
            onChange={e => { setCnpj(maskCnpj(e.target.value)); setErros(p => ({ ...p, cnpj: '' })) }}
          />
          <Counter value={cnpj} max={18} />
        </Field>

        <Field label="Telefone">
          <input
            style={styles.input}
            placeholder="(00) 00000-0000"
            maxLength={15}
            value={telefone}
            onChange={e => setTelefone(maskTelefone(e.target.value))}
          />
        </Field>

        <Field label="E-mail" error={erros.email}>
          <input
            style={{ ...styles.input, ...(erros.email ? styles.inputError : {}) }}
            placeholder="seu@email.com.br"
            maxLength={60}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErros(p => ({ ...p, email: '' })) }}
          />
          <Counter value={email} max={60} />
        </Field>

        <Field label="Observação">
          <textarea
            style={{ ...styles.input, ...styles.textarea }}
            placeholder="Alguma informação adicional sobre a empresa ou o contato?"
            maxLength={500}
            rows={3}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
          />
          <Counter value={observacao} max={500} />
        </Field>

        <button
          style={{ ...styles.btnGravar, ...(gravando ? styles.btnDisabled : {}) }}
          onClick={handleGravar}
          disabled={gravando}
        >
          {gravando ? 'Gravando...' : 'Gravar'}
        </button>

      </div>
    </div>
  )
}

// ─── sub-componentes ──────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.errorMsg}>{error}</span>}
    </div>
  )
}

function Counter({ value, max }: { value: string; max: number }) {
  return <span style={styles.counter}>{value.length}/{max}</span>
}

// ─── estilos ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  pageCenter: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9f9f9',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 32px',
    textAlign: 'center',
    maxWidth: 360,
    width: '100%',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  subtext: {
    fontSize: 15,
    color: '#666',
    lineHeight: 1.6,
  },
  header: {
    background: '#F5A623',
    padding: '16px 20px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    textAlign: 'center',
  },
  body: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    flex: 1,
  },
  bannerParceiro: {
    background: '#fff8ed',
    borderLeft: '3px solid #F5A623',
    borderRadius: '0 6px 6px 0',
    padding: '10px 14px',
    fontSize: 13,
    color: '#7a5a1a',
    marginBottom: 24,
  },
  bannerErro: {
    background: '#fee2e2',
    borderLeft: '3px solid #dc2626',
    borderRadius: '0 6px 6px 0',
    padding: '10px 14px',
    fontSize: 13,
    color: '#7f1d1d',
    marginBottom: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    fontWeight: 500,
  },
  input: {
    border: 'none',
    borderBottom: '1.5px solid #ddd',
    padding: '6px 0',
    fontSize: 15,
    background: 'transparent',
    outline: 'none',
    color: '#222',
    fontFamily: 'inherit',
    resize: 'none' as const,
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderBottomColor: '#dc2626',
  },
  textarea: {
    resize: 'none' as const,
  },
  counter: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right' as const,
    marginTop: 3,
  },
  errorMsg: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 4,
  },
  btnGravar: {
    background: '#F5A623',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '14px',
    fontSize: 16,
    fontWeight: 600,
    width: '100%',
    cursor: 'pointer',
    marginTop: 8,
    marginBottom: 24,
  },
  btnDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #f0f0f0',
    borderTopColor: '#F5A623',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
}
