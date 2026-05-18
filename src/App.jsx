import { useEffect, useMemo, useRef, useState } from 'react';
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
  const lastSavedSnapshotRef = useRef(initial.alunos);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  const showStatus = (message) => {
    setStatusMsg(message);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleInput = (id, valor) => {
    const faltas = clampInt(valor, { min: 0, max: 99 });
    const atualizados = alunos.map((a) =>
      a.id === id ? { ...a, f: faltas } : a
    );
    setAlunos(atualizados);
    setIsDirty(true);
  };

  const db_save_action = () => {
    // Salva no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alunos));
    lastSavedSnapshotRef.current = alunos;
    setIsDirty(false);
    const now = new Date();
    setLastSavedAt(now);
    showStatus(`Alterações salvas às ${now.toLocaleTimeString()}.`);
  };

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
          Salvar alterações
        </button>
        <button className="gf__button gf__button--secondary" onClick={undoChanges} disabled={!isDirty}>
          Desfazer
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

          {alunos.map((aluno) => (
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
        <p>
          Versão: 0.0.2 | Armazenamento: <code>localStorage</code> (chave <code>faltas_data</code>)
        </p>
      </footer>
    </div>
  );
}
