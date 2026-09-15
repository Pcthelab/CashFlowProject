import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import axios from "axios";
import "./App.css";

interface Pessoa {
  id: string;
  nome: string;
  idade: number;
}
interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: "Receita" | "Despesa";
  pessoaId: string;
}
interface Resumo {
  pessoaId: string;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldoIndividual: number;
}
interface Relatorio {
  porPessoa: Resumo[];
  totalGeral: {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquidoGeral: number;
  };
}
type View = "overview" | "transactions" | "people" | "reports";
type IconName =
  | "grid"
  | "arrows"
  | "people"
  | "chart"
  | "plus"
  | "up"
  | "down"
  | "wallet"
  | "chevron"
  | "search"
  | "close"
  | "trash"
  | "download"
  | "check";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5007/api",
  timeout: 10000,
});
const money = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const initials = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
const views: { id: View; label: string; icon: IconName }[] = [
  { id: "overview", label: "Visão geral", icon: "grid" },
  { id: "transactions", label: "Transações", icon: "arrows" },
  { id: "people", label: "Pessoas", icon: "people" },
  { id: "reports", label: "Relatórios", icon: "chart" },
];
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    arrows: "M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4",
    people:
      "M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3",
    chart: "M4 3v17h17M9 15v-4m5 4V6m5 9V9",
    plus: "M12 5v14M5 12h14",
    up: "M7 17 17 7M7 7h10v10",
    down: "m7 7 10 10M7 17h10V7",
    wallet:
      "M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v11H6a3 3 0 0 1-3-3V6M20 12h-5v5h5",
    chevron: "m9 5 7 7-7 7",
    search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-1 5 5 5",
    close: "m6 6 12 12M6 18 18 6",
    trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    check: "m5 12 4 4L19 6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="section-heading">
          <div>
            <h2 id="modal-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export default function App() {
  const [view, setView] = useState<View>("overview");
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"person" | "transaction" | null>(null);
  const [deleting, setDeleting] = useState<Pessoa | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [person, setPerson] = useState("");
  const [tipo, setTipo] = useState<"Receita" | "Despesa">("Despesa");
  async function refresh() {
    setLoading(true);
    try {
      const [p, t, r] = await Promise.all([
        api.get<Pessoa[]>("/pessoas"),
        api.get<Transacao[]>("/transacoes"),
        api.get<Relatorio>("/relatorios"),
      ]);
      setPessoas(p.data);
      setTransacoes(t.data);
      setRelatorio(r.data);
      setLoadError("");
    } catch {
      setLoadError(
        "Não foi possível atualizar os dados. Verifique a conexão com a API e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  useEffect(() => {
    if (notice) {
      const timer = window.setTimeout(() => setNotice(""), 4500);
      return () => window.clearTimeout(timer);
    }
  }, [notice]);
  function openModal(value: "person" | "transaction") {
    setFormError("");
    setPerson("");
    setTipo("Despesa");
    setModal(value);
  }
  function navigate(value: View) {
    setView(value);
    setSearch("");
    setFilter("Todas");
  }
  const personName = (id: string) =>
    pessoas.find((p) => p.id === id)?.nome ?? "Pessoa removida";
  const income = relatorio?.totalGeral.totalReceitas ?? 0;
  const expenses = relatorio?.totalGeral.totalDespesas ?? 0;
  const balance = relatorio?.totalGeral.saldoLiquidoGeral ?? 0;
  const rows = relatorio?.porPessoa ?? [];
  const chartRows = [...rows]
    .sort(
      (a, b) =>
        b.totalReceitas + b.totalDespesas - (a.totalReceitas + a.totalDespesas),
    )
    .slice(0, 6);
  const maxValue = Math.max(
    ...chartRows.flatMap((r) => [r.totalReceitas, r.totalDespesas]),
    1,
  );
  const distribution =
    income + expenses > 0 ? (income / (income + expenses)) * 100 : 0;
  const matches = (s: string) =>
    s.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
  const filtered = transacoes.filter(
    (t) =>
      (filter === "Todas" || t.tipo === filter) &&
      matches(`${t.descricao} ${personName(t.pessoaId)}`),
  );
  const isMinor = (pessoas.find((p) => p.id === person)?.idade ?? 18) < 18;
  const amount = (n: number) => (relatorio ? money(n) : "—");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!String(data.get(modal === "person" ? "nome" : "descricao")).trim()) {
      setFormError("Preencha o nome ou a descrição.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (modal === "person")
        await api.post("/pessoas", {
          nome: String(data.get("nome")).trim(),
          idade: Number(data.get("idade")),
        });
      else
        await api.post("/transacoes", {
          descricao: String(data.get("descricao")).trim(),
          valor: Number(data.get("valor")),
          tipo,
          pessoaId: person,
        });
      setNotice(
        modal === "person"
          ? "Pessoa cadastrada com sucesso."
          : "Transação registrada com sucesso.",
      );
      setModal(null);
      await refresh();
    } catch (error: unknown) {
      setFormError(
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Não foi possível salvar. Verifique os dados e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function removePerson() {
    if (!deleting) return;
    setSaving(true);
    setFormError("");
    try {
      await api.delete(`/pessoas/${deleting.id}`);
      setDeleting(null);
      setNotice("Pessoa removida com sucesso.");
      await refresh();
    } catch {
      setFormError("Não foi possível remover esta pessoa. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }
  function exportReport() {
    const cell = (v: string) => `"${v.replaceAll('"', '""')}"`;
    const content = [
      ["Pessoa", "Receitas (R$)", "Despesas (R$)", "Saldo (R$)"],
      ...rows.map((r) => [
        /^\s*[=+@-]/.test(r.nome) ? `'${r.nome}` : r.nome,
        ...[r.totalReceitas, r.totalDespesas, r.saldoIndividual].map((n) =>
          n.toFixed(2).replace(".", ","),
        ),
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF" + content.map((r) => r.map(cell).join(";")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "cashflow-relatorio.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Relatório exportado.");
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
          aria-label="CashFlow — visão geral"
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          cashflow<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Icon name="wallet" />
          </span>
          <div>
            <strong>Meu espaço</strong>
            <small>Gestão financeira</small>
          </div>
          <span className="workspace-badge">CF</span>
        </div>
        <span className="nav-label">PRINCIPAL</span>
        <nav aria-label="Navegação principal">
          {views.map((v) => (
            <button
              key={v.id}
              className={`nav-item ${view === v.id ? "active" : ""}`}
              aria-label={v.label}
              aria-current={view === v.id ? "page" : undefined}
              onClick={() => navigate(v.id)}
            >
              <Icon name={v.icon} />
              {v.label}
              {v.id === "people" && (
                <span className="nav-count">{pessoas.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">
              <Icon name="chart" />
            </span>
            <h3>Clareza para decidir.</h3>
            <p>
              Suas finanças organizadas.
              <br />
              Suas escolhas mais simples.
            </p>
            <span className="note-line" />
          </div>
          <div className="sidebar-footer">
            <span className="avatar">CF</span>
            <div>
              <strong>CashFlow Project</strong>
              <small>Controle em cada movimento</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Meu espaço <span>/</span>
            <strong>{views.find((v) => v.id === view)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span className={`connection ${loadError ? "offline" : ""}`}>
              <i />
              {loading
                ? "Sincronizando"
                : loadError
                  ? "Sem conexão"
                  : "Dados sincronizados"}
            </span>
            <span className="topbar-divider" />
            <span className="avatar profile-avatar">CF</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">SEU DINHEIRO, COM MAIS CLAREZA</div>
              <h1>
                {views.find((v) => v.id === view)?.label}
                <span>.</span>
              </h1>
              <p>
                {view === "overview"
                  ? "Tudo o que você precisa para acompanhar suas finanças."
                  : view === "transactions"
                    ? "Cada entrada e saída, organizada em um só lugar."
                    : view === "people"
                      ? "Gerencie as pessoas e acompanhe seus resultados."
                      : "Uma visão completa dos seus resultados financeiros."}
              </p>
            </div>
            <button
              className="button primary"
              onClick={() =>
                openModal(view === "people" ? "person" : "transaction")
              }
            >
              <Icon name="plus" size={18} />
              {view === "people" ? "Nova pessoa" : "Nova transação"}
            </button>
          </div>
          {loadError && (
            <div className="error-banner" role="alert">
              {loadError}
              <button onClick={() => void refresh()} disabled={loading}>
                Tentar novamente
              </button>
            </div>
          )}
          {(view === "overview" || view === "reports") && (
            <>
              <div className="overview-caption">
                <span>
                  <i className="live-dot" />
                  Resumo financeiro
                </span>
                <span>
                  Todo o período <span className="caption-divider">·</span>{" "}
                  Valores em BRL
                </span>
              </div>
              <section className="stat-grid" aria-label="Resumo financeiro">
                <article className="stat-card balance-card">
                  <div className="stat-top">
                    <span>Saldo total disponível</span>
                    <span className="stat-icon">
                      <Icon name="wallet" />
                    </span>
                  </div>
                  <strong className="stat-value">{amount(balance)}</strong>
                  <div className="stat-bottom">
                    <span className="balance-pill">
                      <Icon name="check" size={13} />
                      Consolidado
                    </span>
                    <span>Receitas menos despesas</span>
                  </div>
                  <div className="balance-decoration" aria-hidden="true" />
                </article>
                {(
                  [
                    {
                      label: "Total de receitas",
                      value: income,
                      type: "Receita",
                      icon: "up",
                      className: "income",
                      detail: "entradas",
                    },
                    {
                      label: "Total de despesas",
                      value: expenses,
                      type: "Despesa",
                      icon: "down",
                      className: "expense",
                      detail: "saídas",
                    },
                  ] as const
                ).map((s) => (
                  <article className="stat-card" key={s.type}>
                    <div className="stat-top">
                      <span>{s.label}</span>
                      <span className={`stat-icon ${s.className}-icon`}>
                        <Icon name={s.icon} />
                      </span>
                    </div>
                    <strong className="stat-value">{amount(s.value)}</strong>
                    <div className="stat-bottom">
                      <span
                        className={
                          s.type === "Receita" ? "positive" : "negative"
                        }
                      >
                        <Icon name={s.icon} size={14} />
                        {
                          transacoes.filter((t) => t.tipo === s.type).length
                        }{" "}
                        {s.detail}
                      </span>
                      <span>em todo o período</span>
                    </div>
                  </article>
                ))}
              </section>
              <div className="chart-grid">
                <section className="panel flow-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Fluxo por pessoa</h2>
                      <p>Compare as entradas e saídas de cada pessoa</p>
                    </div>
                    <span className="small-tag">Acumulado</span>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i className="income-dot" />
                      Receitas
                    </span>
                    <span>
                      <i className="expense-dot" />
                      Despesas
                    </span>
                  </div>
                  {chartRows.length ? (
                    <div className="bar-chart">
                      <div className="chart-axis">
                        {[1, 0.75, 0.5, 0.25, 0].map((n) => (
                          <span key={n}>
                            {new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(maxValue * n)}
                          </span>
                        ))}
                      </div>
                      <div className="chart-plot">
                        <div className="grid-lines" aria-hidden="true">
                          {[0, 1, 2, 3, 4].map((n) => (
                            <i key={n} />
                          ))}
                        </div>
                        <div className="bar-groups">
                          {chartRows.map((r) => (
                            <div className="bar-group" key={r.pessoaId}>
                              <div className="bar-pair">
                                <div
                                  className="bar income-bar"
                                  style={{
                                    height: `${(r.totalReceitas / maxValue) * 100}%`,
                                  }}
                                  role="img"
                                  aria-label={`${r.nome}: receitas de ${money(r.totalReceitas)}`}
                                  title={money(r.totalReceitas)}
                                />
                                <div
                                  className="bar expense-bar"
                                  style={{
                                    height: `${(r.totalDespesas / maxValue) * 100}%`,
                                  }}
                                  role="img"
                                  aria-label={`${r.nome}: despesas de ${money(r.totalDespesas)}`}
                                  title={money(r.totalDespesas)}
                                />
                              </div>
                              <span className="bar-label" title={r.nome}>
                                {r.nome}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="chart-empty">
                      <Icon name="chart" size={32} />
                      <strong>
                        {loading
                          ? "Carregando seu resumo…"
                          : "Seu fluxo começa aqui"}
                      </strong>
                      <span>
                        Registre pessoas e transações para visualizar o gráfico.
                      </span>
                    </div>
                  )}
                  <div className="chart-footer">
                    <Icon name="people" size={15} />
                    {rows.length > 6
                      ? "As 6 pessoas com maior movimentação"
                      : `${pessoas.length} pessoas no seu espaço`}
                    <span>Receitas e despesas consolidadas</span>
                  </div>
                </section>
                <section className="panel distribution-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Distribuição financeira</h2>
                      <p>O equilíbrio das suas movimentações</p>
                    </div>
                  </div>
                  <div
                    className="donut"
                    style={{
                      background:
                        income + expenses > 0
                          ? `conic-gradient(#4d7cf3 0% ${distribution}%, #f2aa93 ${distribution}% 100%)`
                          : "#e9ecf2",
                    }}
                    role="img"
                    aria-label={`Receitas: ${money(income)}. Despesas: ${money(expenses)}.`}
                  >
                    <div className="donut-center">
                      <span>Movimentações</span>
                      <strong>{transacoes.length}</strong>
                      <small>no total</small>
                    </div>
                  </div>
                  <div className="distribution-row">
                    <span>
                      <i className="income-dot" />
                      Receitas
                    </span>
                    <strong>{amount(income)}</strong>
                  </div>
                  <div className="distribution-row">
                    <span>
                      <i className="expense-dot" />
                      Despesas
                    </span>
                    <strong>{amount(expenses)}</strong>
                  </div>
                  <div className="distribution-insight">
                    <Icon name="chart" size={16} />
                    <span>
                      {income > 0 ? (
                        <>
                          <strong>
                            {((expenses / income) * 100).toLocaleString(
                              "pt-BR",
                              { maximumFractionDigits: 1 },
                            )}
                            %
                          </strong>{" "}
                          das receitas comprometidas
                        </>
                      ) : (
                        "Acompanhe o equilíbrio das suas finanças"
                      )}
                    </span>
                  </div>
                </section>
              </div>
            </>
          )}
          {view !== "transactions" && (
            <section className="panel report-panel">
              <div className="section-heading">
                <div>
                  <h2>
                    {view === "people"
                      ? "Pessoas cadastradas"
                      : "Resumo por pessoa"}
                    <span className="count-badge">{pessoas.length}</span>
                  </h2>
                  <p>Resultados individuais que compõem o seu saldo</p>
                </div>
                {view === "overview" ? (
                  <button
                    className="text-button"
                    onClick={() => navigate("people")}
                  >
                    Gerenciar pessoas
                    <Icon name="chevron" size={15} />
                  </button>
                ) : (
                  <button
                    className="button secondary"
                    onClick={exportReport}
                    disabled={!relatorio}
                  >
                    <Icon name="download" size={16} />
                    Exportar CSV
                  </button>
                )}
              </div>
              {view === "people" && (
                <div className="table-toolbar">
                  <label className="search-field">
                    <Icon name="search" size={18} />
                    <input
                      placeholder="Buscar pessoa…"
                      aria-label="Buscar pessoa"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
              )}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Pessoa</th>
                      <th>Receitas</th>
                      <th>Despesas</th>
                      <th>Saldo disponível</th>
                      {view === "people" && <th>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .filter((r) => matches(r.nome))
                      .map((r, i) => (
                        <tr key={r.pessoaId}>
                          <td>
                            <div className="person-cell">
                              <span className={`avatar tone-${i % 3}`}>
                                {initials(r.nome)}
                              </span>
                              <div>
                                <strong>{r.nome}</strong>
                                <small>
                                  {pessoas.find((p) => p.id === r.pessoaId)
                                    ?.idade ?? "—"}{" "}
                                  anos
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="positive">{money(r.totalReceitas)}</td>
                          <td>{money(r.totalDespesas)}</td>
                          <td>
                            <strong
                              className={
                                r.saldoIndividual < 0 ? "negative" : ""
                              }
                            >
                              {money(r.saldoIndividual)}
                            </strong>
                          </td>
                          {view === "people" && (
                            <td>
                              <button
                                className="icon-button delete-button"
                                aria-label={`Remover ${r.nome}`}
                                onClick={() => {
                                  setFormError("");
                                  setDeleting(
                                    pessoas.find((p) => p.id === r.pessoaId) ??
                                      null,
                                  );
                                }}
                              >
                                <Icon name="trash" size={17} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    {!rows.some((r) => matches(r.nome)) && (
                      <tr>
                        <td
                          colSpan={view === "people" ? 5 : 4}
                          className="empty-cell"
                        >
                          {loading
                            ? "Carregando pessoas…"
                            : "Nenhuma pessoa encontrada. Cadastre uma pessoa para começar."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {view === "transactions" && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>
                    Suas transações{" "}
                    <span className="count-badge">{transacoes.length}</span>
                  </h2>
                  <p>Histórico completo de movimentações</p>
                </div>
              </div>
              <div className="table-toolbar">
                <div className="filter-tabs" aria-label="Filtrar transações">
                  {["Todas", "Receita", "Despesa"].map((t) => (
                    <button
                      key={t}
                      className={filter === t ? "selected" : ""}
                      aria-pressed={filter === t}
                      onClick={() => setFilter(t)}
                    >
                      {t === "Todas" ? t : `${t}s`}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Icon name="search" size={18} />
                  <input
                    placeholder="Buscar transação ou pessoa…"
                    aria-label="Buscar transação ou pessoa"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Pessoa</th>
                      <th>Tipo</th>
                      <th className="align-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="person-cell">
                            <span
                              className={`transaction-icon ${t.tipo === "Receita" ? "income" : "expense"}-icon`}
                            >
                              <Icon
                                name={t.tipo === "Receita" ? "up" : "down"}
                                size={18}
                              />
                            </span>
                            <strong>{t.descricao}</strong>
                          </div>
                        </td>
                        <td>{personName(t.pessoaId)}</td>
                        <td>
                          <span
                            className={`type-badge ${t.tipo === "Receita" ? "income" : "expense"}-icon`}
                          >
                            {t.tipo}
                          </span>
                        </td>
                        <td className="align-right">
                          <strong
                            className={
                              t.tipo === "Receita" ? "positive" : "negative"
                            }
                          >
                            {t.tipo === "Receita" ? "+" : "−"} {money(t.valor)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={4} className="empty-cell">
                          {loading
                            ? "Carregando transações…"
                            : "Nenhuma transação encontrada."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-bottom">
                {filtered.length} transações encontradas
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>
              CashFlow <span>·</span> Mais controle. Mais tranquilidade.
            </span>
            <span>Feito para simplificar.</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dispensar mensagem"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={modal === "person" ? "Nova pessoa" : "Nova transação"}
          subtitle={
            modal === "person"
              ? "Adicione uma pessoa ao seu espaço financeiro."
              : "Registre uma movimentação e mantenha tudo em dia."
          }
          onClose={() => {
            if (!saving) setModal(null);
          }}
        >
          <form onSubmit={submit}>
            {modal === "person" ? (
              <>
                <label>
                  Nome completo
                  <input
                    name="nome"
                    placeholder="Ex.: Ana Oliveira"
                    required
                    maxLength={120}
                  />
                </label>
                <label>
                  Idade
                  <input
                    name="idade"
                    type="number"
                    placeholder="Ex.: 28"
                    min="0"
                    max="130"
                    step="1"
                    required
                  />
                </label>
                <p className="form-hint">
                  Pessoas menores de 18 anos podem registrar apenas despesas.
                </p>
              </>
            ) : (
              <>
                <div className="type-selector">
                  <button
                    type="button"
                    className={
                      tipo === "Despesa" ? "selected expense-selection" : ""
                    }
                    onClick={() => setTipo("Despesa")}
                    aria-pressed={tipo === "Despesa"}
                  >
                    <Icon name="down" size={18} />
                    Despesa
                  </button>
                  <button
                    type="button"
                    className={
                      tipo === "Receita" ? "selected income-selection" : ""
                    }
                    disabled={isMinor}
                    onClick={() => setTipo("Receita")}
                    aria-pressed={tipo === "Receita"}
                  >
                    <Icon name="up" size={18} />
                    Receita
                  </button>
                </div>
                <label>
                  Pessoa
                  <select
                    required
                    value={person}
                    onChange={(e) => {
                      setPerson(e.target.value);
                      if (
                        (pessoas.find((p) => p.id === e.target.value)?.idade ??
                          18) < 18
                      )
                        setTipo("Despesa");
                    }}
                  >
                    <option value="">Selecione uma pessoa</option>
                    {pessoas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.idade} anos)
                      </option>
                    ))}
                  </select>
                </label>
                {!pessoas.length && (
                  <p className="form-hint">
                    Cadastre uma pessoa antes de registrar uma transação.{" "}
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => openModal("person")}
                    >
                      Cadastrar pessoa
                    </button>
                  </p>
                )}
                {isMinor && (
                  <p className="form-hint">
                    Esta pessoa é menor de 18 anos e pode registrar apenas
                    despesas.
                  </p>
                )}
                <label>
                  Descrição
                  <input
                    name="descricao"
                    placeholder="Ex.: Salário, aluguel ou supermercado"
                    required
                    maxLength={200}
                  />
                </label>
                <label>
                  Valor (R$)
                  <input
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    required
                  />
                </label>
              </>
            )}
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                disabled={saving}
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={
                  saving || (modal === "transaction" && !pessoas.length)
                }
              >
                {saving
                  ? "Salvando…"
                  : modal === "person"
                    ? "Cadastrar pessoa"
                    : "Registrar transação"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Remover pessoa?"
          subtitle={`Todas as transações de ${deleting.nome} também serão excluídas. Esta ação não pode ser desfeita.`}
          onClose={() => {
            if (!saving) setDeleting(null);
          }}
        >
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
          <div className="modal-actions">
            <button
              className="button secondary"
              disabled={saving}
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </button>
            <button
              className="button danger"
              disabled={saving}
              onClick={() => void removePerson()}
            >
              {saving ? "Removendo…" : "Remover pessoa"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
