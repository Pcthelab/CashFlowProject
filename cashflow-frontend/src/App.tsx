import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface Pessoa {
  id?: string;
  Id?: string;
  nome?: string;
  Nome?: string;
  idade?: number;
  Idade?: number;
}

interface Transacao {
  id?: string;
  descricao?: string;
  Descricao?: string;
  valor?: number;
  Valor?: number;
  tipo?: string;
  Tipo?: string;
  pessoaId?: string;
  PessoaId?: string;
}

interface PorPessoaItem {
  pessoaId?: string;
  PessoaId?: string;
  nome?: string;
  Nome?: string;
  totalReceitas?: number;
  TotalReceitas?: number;
  totalDespesas?: number;
  TotalDespesas?: number;
  saldoIndividual?: number;
  SaldoIndividual?: number;
}

interface Relatorio {
  porPessoa: PorPessoaItem[];
  totalGeral: {
    totalReceitas?: number;
    TotalReceitas?: number;
    totalDespesas?: number;
    TotalDespesas?: number;
    saldoLiquidoGeral?: number;
    SaldoLiquidoGeral?: number;
  };
}

const API_PESSOAS = 'http://localhost:5007/api/pessoas';
const API_TRANSACOES = 'http://localhost:5007/api/transacoes';
const API_RELATORIOS = 'http://localhost:5007/api/relatorios';

const colorPalette = {
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  receita: '#059669',
  despesa: '#dc2626',
  subtle: '#0f172a',
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    maxWidth: '1024px',
    margin: '0 auto',
    backgroundColor: colorPalette.background,
    color: colorPalette.textPrimary,
  } as React.CSSProperties,

  header: {
    marginBottom: '40px',
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: colorPalette.subtle,
  } as React.CSSProperties,

  divider: {
    marginTop: '16px',
    marginBottom: '32px',
    border: 'none',
    height: '1px',
    backgroundColor: colorPalette.border,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '28px',
    marginBottom: '32px',
  } as React.CSSProperties,

  card: {
    padding: '28px',
    borderRadius: '8px',
    backgroundColor: colorPalette.surface,
    border: `1px solid ${colorPalette.border}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,

  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: 700,
    color: colorPalette.textPrimary,
  } as React.CSSProperties,

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,

  input: {
    padding: '12px 14px',
    fontSize: '14px',
    borderRadius: '6px',
    border: `1px solid ${colorPalette.border}`,
    backgroundColor: colorPalette.surface,
    color: colorPalette.textPrimary,
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  primaryBtn: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: colorPalette.textPrimary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  dangerBtn: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: colorPalette.despesa,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  badgeReceita: {
    display: 'inline-block',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: '#f0fdf4',
    color: colorPalette.receita,
    borderRadius: '6px',
  } as React.CSSProperties,

  badgeDespesa: {
    display: 'inline-block',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: '#fef2f2',
    color: colorPalette.despesa,
    borderRadius: '6px',
  } as React.CSSProperties,

  reportSection: {
    padding: '28px',
    borderRadius: '8px',
    backgroundColor: colorPalette.surface,
    border: `1px solid ${colorPalette.border}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,

  reportTitle: {
    margin: '0 0 24px 0',
    fontSize: '18px',
    fontWeight: 700,
    color: colorPalette.textPrimary,
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  } as React.CSSProperties,

  tableHead: {
    backgroundColor: colorPalette.background,
  } as React.CSSProperties,

  tableHeaderCell: {
    padding: '14px 12px',
    textAlign: 'left' as const,
    fontWeight: 700,
    fontSize: '13px',
    color: colorPalette.textSecondary,
    borderBottom: `1px solid ${colorPalette.border}`,
  } as React.CSSProperties,

  tableBodyCell: {
    padding: '14px 12px',
    borderBottom: `1px solid ${colorPalette.border}`,
    color: colorPalette.textPrimary,
  } as React.CSSProperties,

  emptyState: {
    padding: '32px 12px',
    textAlign: 'center' as const,
    color: colorPalette.textSecondary,
  } as React.CSSProperties,

  summaryContainer: {
    marginTop: '32px',
    padding: '24px',
    backgroundColor: colorPalette.background,
    borderRadius: '8px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  } as React.CSSProperties,

  summaryCard: {
    textAlign: 'center' as const,
  } as React.CSSProperties,

  summaryLabel: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: colorPalette.textSecondary,
    marginBottom: '8px',
  } as React.CSSProperties,

  summaryValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: colorPalette.textPrimary,
  } as React.CSSProperties,
};

export default function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('Despesa');
  const [pessoaSelecionada, setPessoaSelecionada] = useState('');

  const getPessoaId = (p: Pessoa) => p.id ?? p.Id ?? '';
  const getPessoaNome = (p: Pessoa) => p.nome ?? p.Nome ?? '—';
  const getPessoaIdade = (p: Pessoa) => p.idade ?? p.Idade ?? 0;

  const getPorPessoaId = (r: PorPessoaItem) => r.pessoaId ?? r.PessoaId ?? '';
  const getPorPessoaNome = (r: PorPessoaItem) => r.nome ?? r.Nome ?? '—';
  const getNumber = (v?: number, alt?: number) => (v !== undefined ? v : (alt ?? 0));

  const carregarDados = async () => {
    try {
      const [resPessoas, resTransacoes, resRelatorio] = await Promise.all([
        axios.get(API_PESSOAS),
        axios.get(API_TRANSACOES),
        axios.get(API_RELATORIOS),
      ]);

      setPessoas(resPessoas.data);
      setTransacoes(resTransacoes.data);
      setRelatorio(resRelatorio.data);
    } catch (erro: unknown) {
      if (axios.isAxiosError(erro)) {
        console.error('Erro ao sincronizar com a API:', (erro as AxiosError).message);
      } else {
        console.error('Erro inesperado ao sincronizar:', erro);
      }
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const cadastrarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !idade) return alert('Preencha todos os campos!');
    try {
      await axios.post(API_PESSOAS, {
        Nome: nome,
        Idade: parseInt(idade, 10),
      });
      setNome(''); setIdade('');
      carregarDados();
      alert('Pessoa cadastrada com sucesso!');
    } catch (erro: unknown) {
      if (axios.isAxiosError(erro)) {
        console.error('Erro ao cadastrar pessoa:', erro.message);
      }
      alert('Erro ao cadastrar pessoa.');
    }
  };

  const deletarPessoa = async (idObtido: string) => {
    if (!idObtido) return alert('ID inválido.');

    if (confirm('Deseja mesmo excluir? Todas as transações vinculadas serão apagadas automaticamente!')) {
      try {
        await axios.delete(`${API_PESSOAS}/${idObtido}`);
        carregarDados();
        alert('Pessoa removida com sucesso!');
      } catch (erro: unknown) {
        if (axios.isAxiosError(erro)) {
          console.error('Erro no delete:', erro.message);
        }
        alert('Erro ao deletar. Certifique-se de que o backend está ativo e aceita o ID informado.');
      }
    }
  };

  const cadastrarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !pessoaSelecionada) return alert('Preencha todos os campos!');

    try {
      await axios.post(API_TRANSACOES, {
        Descricao: descricao,
        Valor: parseFloat(valor),
        Tipo: tipo,
        PessoaId: pessoaSelecionada,
      });

      setDescricao(''); setValor('');
      carregarDados();
      alert('Transação cadastrada com sucesso!');
    } catch (erro: unknown) {
      if (axios.isAxiosError(erro) && erro.response && erro.response.data) {
        const data = erro.response.data;
        alert(typeof data === 'string' ? data : 'Erro na validação da transação.');
      } else {
        alert('Erro ao cadastrar transação.');
      }
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>CashFlowProject</h1>
        <hr style={styles.divider} />
      </header>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Cadastrar Pessoa</h3>
          <form onSubmit={cadastrarPessoa} style={styles.form}>
            <input
              aria-label="Nome"
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              style={styles.input}
            />
            <input
              aria-label="Idade"
              type="number"
              placeholder="Idade"
              value={idade}
              onChange={e => setIdade(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.primaryBtn}>Salvar Pessoa</button>
          </form>
        </section>

        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Registrar Transação</h3>
          <form onSubmit={cadastrarTransacao} style={styles.form}>
            <select
              value={pessoaSelecionada}
              onChange={e => setPessoaSelecionada(e.target.value)}
              style={styles.input}
            >
              <option value="">Selecione a pessoa</option>
              {pessoas.map(p => {
                const idReal = getPessoaId(p);
                const nomeReal = getPessoaNome(p);
                const idadeReal = getPessoaIdade(p);
                return (
                  <option key={idReal} value={idReal}>{nomeReal} ({idadeReal} anos)</option>
                );
              })}
            </select>
            <input
              type="text"
              placeholder="Descrição (ex: Salário, Aluguel)"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={valor}
              onChange={e => setValor(e.target.value)}
              style={styles.input}
            />
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              style={styles.input}
            >
              <option value="Despesa">Despesa</option>
              <option value="Receita">Receita</option>
            </select>
            <button type="submit" style={styles.primaryBtn}>Registrar Transação</button>
          </form>
        </section>
      </div>

      <section style={styles.reportSection}>
        <h2 style={styles.reportTitle}>Extrato Financeiro</h2>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeaderCell}>Titular</th>
              <th style={styles.tableHeaderCell}>Receitas</th>
              <th style={styles.tableHeaderCell}>Despesas</th>
              <th style={styles.tableHeaderCell}>Saldo</th>
              <th style={styles.tableHeaderCell}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!relatorio || relatorio.porPessoa.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyState}>
                  Nenhum registro de transação
                </td>
              </tr>
            ) : (
              relatorio.porPessoa.map(r => {
                const pId = getPorPessoaId(r);
                const pNome = getPorPessoaNome(r);
                const tReceitas = getNumber(r.totalReceitas, r.TotalReceitas);
                const tDespesas = getNumber(r.totalDespesas, r.TotalDespesas);
                const sIndividual = getNumber(r.saldoIndividual, r.SaldoIndividual);

                return (
                  <tr key={pId}>
                    <td style={styles.tableBodyCell}>
                      <strong>{pNome}</strong>
                    </td>
                    <td style={styles.tableBodyCell}>
                      <span style={styles.badgeReceita}>R$ {Number(tReceitas).toFixed(2)}</span>
                    </td>
                    <td style={styles.tableBodyCell}>
                      <span style={styles.badgeDespesa}>R$ {Number(tDespesas).toFixed(2)}</span>
                    </td>
                    <td style={{
                      ...styles.tableBodyCell,
                      fontWeight: 700,
                      color: sIndividual >= 0 ? colorPalette.receita : colorPalette.despesa,
                    }}>
                      R$ {Number(sIndividual).toFixed(2)}
                    </td>
                    <td style={styles.tableBodyCell}>
                      <button
                        onClick={() => deletarPessoa(pId)}
                        style={styles.dangerBtn}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {relatorio && (
          <div style={styles.summaryContainer}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Receitas</div>
              <div style={{ ...styles.summaryValue, color: colorPalette.receita }}>
                R$ {Number(getNumber(relatorio.totalGeral.totalReceitas, relatorio.totalGeral.TotalReceitas)).toFixed(2)}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Total Despesas</div>
              <div style={{ ...styles.summaryValue, color: colorPalette.despesa }}>
                R$ {Number(getNumber(relatorio.totalGeral.totalDespesas, relatorio.totalGeral.TotalDespesas)).toFixed(2)}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryLabel}>Saldo Líquido</div>
              <div style={{
                ...styles.summaryValue,
                color: getNumber(relatorio.totalGeral.saldoLiquidoGeral, relatorio.totalGeral.SaldoLiquidoGeral) >= 0
                  ? colorPalette.receita
                  : colorPalette.despesa,
              }}>
                R$ {Number(getNumber(relatorio.totalGeral.saldoLiquidoGeral, relatorio.totalGeral.SaldoLiquidoGeral)).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
