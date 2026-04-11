import React, { useState, useEffect } from 'react';
import CardContador from './CardContador';
import Cadastro from './Cadastro';
import { supabase } from './supabase';

const servicos = [
  { label: "Fecho de contas",         emoji: "📋" },
  { label: "Organização de contabilidade", emoji: "📊" },
  { label: "Declarações fiscais",           emoji: "📄" },
  { label: "Auditoria",                     emoji: "🔍" },
  { label: "Consultoria financeira",        emoji: "💬" },
  { label: "Tempo inteiro",                 emoji: "🕐" },
];

export default function App() {
  const [tela, setTela] = useState('home');
  const [contadores, setContadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroServico, setFiltroServico] = useState('');

  useEffect(() => {
    carregarContadores();
  }, []);

  const carregarContadores = async () => {
    setCarregando(true);
    // REMOVIDO: .eq('aprovado', true) - Agora todos aparecem imediatamente
    const { data, error } = await supabase
      .from('contabilistas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar:', error.message);
    } else {
      setContadores(data || []);
    }
    setCarregando(false);
  };

  const remover = async (id) => {
    if (!window.confirm("Tens a certeza que queres remover este perfil permanentemente?")) return;
    
    const { error } = await supabase
      .from('contabilistas')
      .delete()
      .eq('id', id);

    if (!error) {
      setContadores(prev => prev.filter(c => c.id !== id));
    }
  };

  const aoSalvarCadastro = (novo) => {
    // Adiciona logo na lista para o utilizador ver o seu perfil criado
    setContadores(prev => [novo, ...prev]);
    setTela('sucesso');
  };


  const listaFiltrada = contadores.filter(p => {
    const texto = busca.toLowerCase();
    const termoMatch = (
      p.nome?.toLowerCase().includes(texto) ||
      p.cidade?.toLowerCase().includes(texto) ||
      p.especialidade?.toLowerCase().includes(texto)
    );
    const servicoMatch = filtroServico === '' || p.tipo_servico?.includes(filtroServico);
    
    return termoMatch && servicoMatch;
  });

  if (tela === 'cadastro') {
    return <Cadastro aoVoltar={() => setTela('home')} aoSalvar={aoSalvarCadastro} />;
  }

  if (tela === 'sucesso') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-sm w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Perfil Ativo!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            O teu perfil já está online e visível para todas as PMEs em Angola. Boa sorte com os novos clientes!
          </p>
          <button
            onClick={() => setTela('home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100"
          >
            Ver no Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-100 py-12 text-center shadow-sm">
        <h1 className="text-5xl font-black text-blue-600 tracking-tight mb-2">
          Me Contrata <span className="text-3xl">🇦🇴</span>
        </h1>
        <p className="text-slate-700 font-medium text-lg">Encontra o teu contabilista em 2 minutos</p>
        
        <div className="flex justify-center gap-8 mt-8">
          <Stat label="Ativos" value={carregando ? '...' : contadores.length} />
          <Stat label="PMEs" value="120+" />
          <Stat label="Províncias" value="3" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 shadow-lg shadow-blue-200">
          <div className="text-center md:text-left">
            <p className="font-bold text-white text-lg">És contabilista?</p>
            <p className="text-blue-50 text-sm opacity-90">Regista-te e recebe clientes diretamente no WhatsApp</p>
          </div>
          <button
            onClick={() => setTela('cadastro')}
            className="bg-white text-blue-600 text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all whitespace-nowrap"
          >
            Registar Agora →
          </button>
        </div>

        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input
            className="w-full pl-12 pr-4 py-4 border-2 border-transparent rounded-2xl bg-white shadow-md focus:border-blue-500 focus:outline-none transition-all text-base"
            placeholder="Nome, cidade ou especialidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h2 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Filtrar por serviço:</h2>
          <div className="flex flex-wrap gap-2">
            <FilterBtn active={filtroServico === ''} onClick={() => setFiltroServico('')} label="Todos" />
            {servicos.map(s => (
              <FilterBtn 
                key={s.label}
                active={filtroServico === s.label} 
                onClick={() => setFiltroServico(s.label)} 
                label={s.label} 
                emoji={s.emoji}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {carregando ? (
             [1,2,3].map(i => <Skeleton key={i} />)
          ) : listaFiltrada.length > 0 ? (
            listaFiltrada.map((p) => (
              <CardContador key={p.id} {...p} isAdmin={false} aoRemover={() => remover(p.id)} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-5xl mb-4">🔎</p>
              <p className="font-bold text-slate-600">Sem resultados para esta busca</p>
              <button onClick={() => {setBusca(''); setFiltroServico('')}} className="text-blue-600 text-sm font-semibold mt-2 underline">Limpar filtros</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-2xl font-black text-slate-800">{value}</p>
    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</p>
  </div>
);

const FilterBtn = ({ active, onClick, label, emoji }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {emoji && <span>{emoji}</span>} {label}
  </button>
);

const Skeleton = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse">
    <div className="flex gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  </div>
);