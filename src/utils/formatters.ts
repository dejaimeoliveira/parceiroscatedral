export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';
  const cleaned = cnpj.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  if (!match) return cleaned;
  return !match[2] ? match[1] 
       : !match[3] ? `${match[1]}.${match[2]}`
       : !match[4] ? `${match[1]}.${match[2]}.${match[3]}`
       : !match[5] ? `${match[1]}.${match[2]}.${match[3]}/${match[4]}`
       : `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
}

export function formatTelefone(telefone: string): string {
  if (!telefone) return '';
  const cleaned = telefone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})$/);
  if (!match) return cleaned;
  return !match[2] ? (match[1] ? `(${match[1]}` : '')
       : !match[3] ? `(${match[1]}) ${match[2]}`
       : !match[4] ? `(${match[1]}) ${match[2]}${match[3]}`
       : `(${match[1]}) ${match[2]}${match[3]}-${match[4]}`;
}
