import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'faltas_data';
const DEFAULT_ALUNOS = [
  { id: 1, matricula: '2023001', nome: 'Ana Souza', f: 0 },
  { id: 2, matricula: '2023002', nome: 'Beto Lima', f: 0 },
  { id: 3, matricula: '2023003', nome: 'Clara Luz', f: 0 },
];

function clampInt(value, { min, max }) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function normalizeAlunos(input) {
  if (!Array.isArray(input)) return [];
  return input.map((a) => ({
    ...a,
    f: clampInt(a?.f ?? 0, { min: 0, max: 99 }),
  }));
}

function loadInitial() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { alunos: DEFAULT_ALUNOS, statusMsg: 'Dados iniciais carregados (sem dados salvos).' };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      alunos: normalizeAlunos(parsed),
      statusMsg: 'Dados carregados do armazenamento local.',
    };
  } catch {
    return {
      alunos: DEFAULT_ALUNOS,
      statusMsg: 'Dados iniciais carregados (dados salvos inválidos).',
    };
  }
}

export default function App() {
  const initial = useMemo(() => loadInitial(), []);
  const [alunos, setAlunos] = useState(initial.alunos);
  const [statusMsg, setStatusMsg] = useState(initial.statusMsg);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [query, setQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const lastSavedSnapshotRef = useRef(initial.alunos);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  const showStatus = useCallback((message) => {
    setStatusMsg(message);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatusMsg(''), 4000);
  }, []);

  const handleInput = (id, valor) => {
    const faltas = clampInt(valor, { min: 0, max: 99 });
    const atualizados = alunos.map((a) =>
      a.id === id ? { ...a, f: faltas } : a
    );
    setAlunos(atualizados);
    setIsDirty(true);
  };

  const db_save_action = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
      lastSavedSnapshotRef.current = alunos;
      setIsDirty(false);
      const now = new Date();
      setLastSavedAt(now);
      showStatus(`Alterações salvas às ${now.toLocaleTimeString()}.`);
    } catch {
      showStatus('Não foi possível salvar (armazenamento indisponível/cheio).');
    }
  }, [alunos, showStatus]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = String(e.key || '').toLowerCase();
      const isSave = (e.ctrlKey || e.metaKey) && key === 's';
      if (isSave) {
        e.preventDefault();
        if (isDirty) db_save_action();
        return;
      }

      if (key === 'escape') {
        setStatusMsg('');
      }

      if (key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setHelpOpen((v) => !v);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [db_save_action, isDirty]);

  const undoChanges = () => {
    const snapshot = lastSavedSnapshotRef.current;
    if (!snapshot) return;
    setAlunos(snapshot);
    setIsDirty(false);
    showStatus('Alterações desfeitas (voltou ao último salvamento).');
  };

  const subtitle = useMemo(() => {
    if (isDirty) return 'Você tem alterações não salvas.';
    if (lastSavedAt) return `Tudo salvo. Último salvamento: ${lastSavedAt.toLocaleTimeString()}.`;
    return 'Tudo salvo.';
  }, [isDirty, lastSavedAt]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return alunos;
    return alunos.filter((a) => {
      const nome = String(a.nome || '').toLowerCase();
      const mat = String(a.matricula || '').toLowerCase();
      return nome.includes(q) || mat.includes(q);
    });
  }, [alunos, query]);

  const totals = useMemo(() => {
    const totalFaltas = alunos.reduce((sum, a) => sum + (Number(a.f) || 0), 0);
    return { totalAlunos: alunos.length, totalFaltas };
  }, [alunos]);

  return (
    <div className="gf">
      <header className="gf__header">
        <h1 className="gf__title">Gerenciador de Faltas</h1>
        <p className={`gf__subtitle ${isDirty ? 'gf__subtitle--warn' : ''}`}>{subtitle}</p>
        {statusMsg ? (
          <div className="gf__status" role="status" aria-live="polite">
            {statusMsg}
          </div>
        ) : null}
      </header>

      <section className="gf__actions" aria-label="Ações">
        <button className="gf__button" onClick={db_save_action} disabled={!isDirty}>
          Salvar alterações <span className="gf__kbd">Ctrl/⌘ S</span>
        </button>
        <button className="gf__button gf__button--secondary" onClick={undoChanges} disabled={!isDirty}>
          Desfazer
        </button>

        <div className="gf__spacer" />

        <label className="gf__search">
          <span className="gf__searchLabel">Buscar</span>
          <input
            className="gf__searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou matrícula"
            aria-label="Buscar aluno por nome ou matrícula"
          />
        </label>
        {query.trim() ? (
          <button className="gf__button gf__button--secondary" onClick={() => setQuery('')}>
            Limpar
          </button>
        ) : null}

        <button
          className="gf__button gf__button--secondary"
          onClick={() => setHelpOpen((v) => !v)}
          aria-expanded={helpOpen}
          aria-controls="ajuda"
        >
          Ajuda <span className="gf__kbd">?</span>
        </button>
      </section>

      <section className="gf__card" aria-label="Lista de alunos">
        <div className="gf__table">
          <div className="gf__row gf__row--head" role="row">
            <div className="gf__cell gf__cell--id">ID</div>
            <div className="gf__cell gf__cell--mat">Matrícula</div>
            <div className="gf__cell gf__cell--name">Nome</div>
            <div className="gf__cell gf__cell--faltas">Faltas</div>
          </div>

          {filtered.length === 0 ? (
            <div className="gf__empty" role="status">
              Nenhum aluno encontrado para “{query.trim()}”.
            </div>
          ) : null}

          {filtered.map((aluno) => (
            <div key={aluno.id} className="gf__row" role="row">
              <div className="gf__cell gf__cell--id">{aluno.id}</div>
              <div className="gf__cell gf__cell--mat">{aluno.matricula}</div>
              <div className="gf__cell gf__cell--name">{aluno.nome}</div>
              <div className="gf__cell gf__cell--faltas">
                <input
                  type="number"
                  min={0}
                  max={99}
                  step={1}
                  inputMode="numeric"
                  value={aluno.f}
                  onChange={(e) => handleInput(aluno.id, e.target.value)}
                  className="gf__input"
                  aria-label={`Faltas de ${aluno.nome}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="gf__footer">
        <p className="gf__summary">
          Resumo: <strong>{totals.totalAlunos}</strong> alunos | <strong>{totals.totalFaltas}</strong> faltas no total
        </p>

        <details id="ajuda" className="gf__help" open={helpOpen} onToggle={(e) => setHelpOpen(e.currentTarget.open)}>
          <summary className="gf__helpSummary">Como usar</summary>
          <ul className="gf__helpList">
            <li>Edite o campo “Faltas” (valores entre 0 e 99).</li>
            <li>Quando aparecer “alterações não salvas”, clique em “Salvar alterações” ou use <code>Ctrl/⌘ S</code>.</li>
            <li>Use “Desfazer” para voltar ao último salvamento.</li>
            <li>Use “Buscar” para encontrar por nome ou matrícula.</li>
            <li>Atalho: pressione <code>?</code> para abrir/fechar esta ajuda.</li>
          </ul>
        </details>
        <p>
          Versão: 0.0.3 | Armazenamento: <code>localStorage</code> (chave <code>faltas_data</code>)
        </p>
      </footer>
    </div>
  );
}
