import React, { useState, useEffect } from 'react';

export default function App() {
  const [alunos, setAlunos] = useState([]);

  // Carrega os dados do localStorage ao iniciar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('faltas_data');
    if (dadosSalvos) {
      setAlunos(JSON.parse(dadosSalvos));
    } else {
      // Dados iniciais caso o storage esteja vazio
      const inicial = [
        { id: 1, matricula: "2023001", nome: "Ana Souza", f: 0 },
        { id: 2, matricula: "2023002", nome: "Beto Lima", f: 0 },
        { id: 3, matricula: "2023003", nome: "Clara Luz", f: 0 },
      ];
      setAlunos(inicial);
    }
  }, []);

  const handleInput = (id, valor) => {
    const atualizados = alunos.map(a => 
      a.id === id ? { ...a, f: valor } : a
    );
    setAlunos(atualizados);
  };

  const db_save_action = () => {
    // Salva no localStorage
    localStorage.setItem('faltas_data', JSON.stringify(alunos));
    // AQUI ESTÁ O ERRO DE IHC: Não tem feedback! O usuário clica e nada acontece na tela.
    console.log("Storage atualizado");
  };

  return (
    <div className="p-8 font-mono">
      <h1 className="text-2xl mb-4 text-red-600">SISTEMA_GESTOR_V1 (BETA)</h1>
      
      <div className="border-2 border-black">
        {alunos.map(aluno => (
          <div key={aluno.id} className="flex items-center gap-4 p-2 border-b border-black">
            <span className="w-20">ID: {aluno.id}</span>
            <span className="flex-1 font-bold">{aluno.nome}</span>
            
            <input 
              type="number" 
              value={aluno.f} 
              onChange={(e) => handleInput(aluno.id, e.target.value)}
              className="w-16 border border-red-500 bg-yellow-50"
            />
            
            <button 
              onClick={db_save_action}
              className="bg-gray-300 px-2 border border-black hover:bg-gray-400"
            >
              COMMIT_VAL
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={db_save_action}
        className="mt-10 bg-black text-white p-6 w-full"
      >
        SYNC_LOCAL_STORAGE_DB_RUN
      </button>

      <p className="mt-4 text-xs">Versão: 0.0.1-alpha | Database: Browser_Local</p>
    </div>
  );
}