import React, { useState, useEffect } from 'react';
import CardContador from './CardContador';
import Cadastro from './Cadastro';
import { supabase } from './supabase';

const servicos = [
  { label: "Fecho de contas",              emoji: "📋" },
  { label: "Organização de contabilidade", emoji: "📊" },
  { label: "Declarações fiscais",          emoji: "📄" },
  { label: "Auditoria",                    emoji: "🔍" },
  { label: "Consultoria financeira",       emoji: "💬" },
  { label: "Tempo inteiro",               emoji: "🕐" },
];

export default function App() {
  const [tela, setTela] = useState('home');
  const [contadores, setContadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroServico, setFiltroServico] = useState('');

  // Carregar contabilistas do Supabase
  useEffect(() => {
    carregarContadores();
  }, []);

  const carregarContadores = async () => {
    setCarregando(true);
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
    const { error } = await supabase
      .from('contabilistas')
      .delete()
      .eq('id', id);

    if (!error) {
      setContadores(prev => prev.filter(c => c.id !== id));
    }
  };

  const aoSalvarCadastro = (novo) => {
    setContadores(prev => [novo, ...prev]);
    setTela('sucesso');
  };

  const listaFiltrada = contadores.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroServico === '' || p.tipo_servico?.includes(filtroServico))
  );

  // ── TELA: CADASTRO ──
  if (tela === 'cadastro') {
    return (
      <Cadastro
        aoVoltar={() => setTela('home')}
        aoSalvar={aoSalvarCadastro}
      />
    );
  }

  // ── TELA: SUCESSO ──
  if (tela === 'sucesso') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Perfil criado!</h2>
          <p className="text-slate-500 text-sm mb-6">
            O teu perfil foi submetido e ficará visível após revisão da equipa Me Contrata. Vais ser contactado pelo WhatsApp em breve.
          </p>
          <button
            onClick={() => { setTela('home'); carregarContadores(); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // ── TELA: HOME ──
  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* HEADER / HERO */}
      <header className="bg-white border-b border-slate-100 py-10 text-center shadow-sm">
        <h1 className="text-5xl font-black text-blue-600 tracking-tight">
          Me Contrata 🇦🇴
        </h1>
        <p className="text-slate-800 font-semibold text-lg mt-2">
          Encontra o teu contabilista em 2 minutos
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Marketplace de contabilistas verificados para PMEs angolanas
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {carregando ? '...' : contadores.length}
            </p>
            <p className="text-xs text-slate-500">Contabilistas activos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">120+</p>
            <p className="text-xs text-slate-500">PMEs servidas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-xs text-slate-500">Províncias cobertas</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-6">

        {/* BANNER CTA */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-semibold text-blue-800 text-sm">És contabilista?</p>
            <p className="text-blue-600 text-xs mt-0.5">
              Regista-te e recebe clientes PME directamente no WhatsApp
            </p>
          </div>
          <button
            onClick={() => setTela('cadastro')}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Registar-me →
          </button>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
          <input
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Procurar por nome, cidade ou especialidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* FILTROS */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h2 className="font-semibold text-slate-700 mb-3 text-sm">
            Preciso de um contabilista para:
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroServico('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filtroServico === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {servicos.map((s) => (
              <button
                key={s.label}
                onClick={() => setFiltroServico(s.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filtroServico === s.label
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTAGEM */}
        <p className="text-xs text-slate-400 mb-3 px-1">
          {carregando
            ? 'A carregar...'
            : `${listaFiltrada.length} profissional${listaFiltrada.length !== 1 ? 'is' : ''} encontrado${listaFiltrada.length !== 1 ? 's' : ''}`
          }
        </p>

        {/* LISTA */}
        <div className="flex flex-col gap-4 mb-8">
          {carregando ? (
            // Skeleton loader
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : listaFiltrada.length > 0 ? (
            listaFiltrada.map((p) => (
              <CardContador
                key={p.id}
                {...p}
                // mapear campo do supabase para a prop esperada
                tipoServico={p.tipo_servico}
                foto={p.foto_url}
                aoRemover={() => remover(p.id)}
              />
            ))
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">Nenhum profissional encontrado</p>
              <p className="text-sm mt-1">Tenta ajustar os filtros ou o nome</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
