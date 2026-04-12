import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const ADMIN_PASSWORD = 'Texa2005@'; // muda para a tua password

// Componente que gera URL assinado para ver o documento
function VerDocumento({ documentoUrl }) {
  const [abrindo, setAbrindo] = useState(false);

  const verDocumento = async () => {
    setAbrindo(true);
    // extrai o nome do ficheiro do URL
    const partes = documentoUrl.split('/documentos/');
    if (partes.length < 2) {
      window.open(documentoUrl, '_blank');
      setAbrindo(false);
      return;
    }
    const nomeFicheiro = partes[1];
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(nomeFicheiro, 60); // URL válido 60 segundos

    if (error || !data?.signedUrl) {
      alert('Erro ao abrir documento. Tenta novamente.');
    } else {
      window.open(data.signedUrl, '_blank');
    }
    setAbrindo(false);
  };

  return (
    <button
      onClick={verDocumento}
      disabled={abrindo}
      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-2 rounded-xl transition-colors mb-3 w-fit disabled:opacity-60"
    >
      {abrindo ? (
        <><span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> A abrir...</>
      ) : (
        <>📎 Ver documento de verificação</>
      )}
    </button>
  );
}

function getIniciais(nome) {
  return nome ? nome.split(' ').filter(n => n.length > 0).slice(0, 2).map(n => n[0]).join('').toUpperCase() : '??';
}

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [erroPassword, setErroPassword] = useState(false);
  const [perfis, setPerfis] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [aba, setAba] = useState('pendentes');

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAutenticado(true);
      setErroPassword(false);
    } else {
      setErroPassword(true);
    }
  };

  useEffect(() => {
    if (autenticado) carregarDados();
  }, [autenticado, aba]);

  const carregarDados = async () => {
    setCarregando(true);
    if (aba === 'denuncias') {
      const { data } = await supabase.from('denuncias').select('*').order('created_at', { ascending: false });
      setDenuncias(data || []);
    } else if (aba === 'feedbacks') {
      const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
      setFeedbacks(data || []);
    } else {
      const { data } = await supabase
        .from('contabilistas')
        .select('*')
        .eq('aprovado', aba === 'aprovados')
        .order('created_at', { ascending: false });
      setPerfis(data || []);
    }
    setCarregando(false);
  };

  const aprovar = async (id) => {
    await supabase.from('contabilistas').update({ aprovado: true }).eq('id', id);
    setPerfis(prev => prev.filter(p => p.id !== id));
  };

  const rejeitar = async (id) => {
    if (!confirm('Tens a certeza que queres apagar este perfil?')) return;
    await supabase.from('contabilistas').delete().eq('id', id);
    setPerfis(prev => prev.filter(p => p.id !== id));
  };

  const verificar = async (id, valorActual) => {
    await supabase.from('contabilistas').update({ verificado: !valorActual }).eq('id', id);
    setPerfis(prev => prev.map(p => p.id === id ? { ...p, verificado: !valorActual } : p));
  };

  const apagarDenuncia = async (id) => {
    await supabase.from('denuncias').delete().eq('id', id);
    setDenuncias(prev => prev.filter(d => d.id !== id));
  };

  // ── LOGIN ──
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Painel Admin</h1>
          <p className="text-sm text-slate-500 mb-6">Me Contrata — acesso restrito</p>
          <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
          <input
            type="password"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 ${erroPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setErroPassword(false); }}
            onKeyDown={e => e.key === 'Enter' && login()}
          />
          {erroPassword && <p className="text-xs text-red-500 mb-3">Password incorrecta.</p>}
          <button onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ── PAINEL ──
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-bold text-slate-800">Painel Admin</h1>
          <p className="text-xs text-slate-400">Me Contrata</p>
        </div>
        <button onClick={() => setAutenticado(false)}
          className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">
          Sair
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-6">

        {/* Abas */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex-wrap">
          {[
            { key: 'pendentes', label: '⏳ Pendentes' },
            { key: 'aprovados', label: '✅ Aprovados' },
            { key: 'denuncias', label: '🚩 Denúncias' },
            { key: 'feedbacks', label: '💬 Feedbacks' },
          ].map(a => (
            <button key={a.key} onClick={() => setAba(a.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                aba === a.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {a.label}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="text-center py-16 text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">A carregar...</p>
          </div>
        ) : (
          <>
            {/* PERFIS */}
            {aba !== 'denuncias' && (
              perfis.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-4xl mb-3">{aba === 'pendentes' ? '🎉' : '📭'}</p>
                  <p className="font-medium">{aba === 'pendentes' ? 'Nenhum perfil pendente!' : 'Nenhum perfil aprovado ainda.'}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {perfis.map(p => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">

                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                          {p.foto_url
                            ? <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                            : getIniciais(p.nome)
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800">{p.nome}</p>
                            {p.verificado && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ Verificado</span>}
                          </div>
                          <p className="text-sm text-slate-500">{p.especialidade} · {p.experiencia} anos · {p.cidade}</p>
                          <p className="text-xs text-slate-400 mt-0.5">📱 +244{p.whatsapp} · {p.preco}</p>
                        </div>
                      </div>

                      {/* Serviços */}
                      {p.tipo_servico?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {p.tipo_servico.map(s => (
                            <span key={s} className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}

                      {/* Documento */}
                      {p.documento_url ? (
                        <VerDocumento documentoUrl={p.documento_url} />
                      ) : (
                        <p className="text-xs text-slate-300 mb-3">Sem documento enviado</p>
                      )}

                      <p className="text-xs text-slate-300 mb-4">
                        Registado em {new Date(p.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>

                      {/* Acções */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        {aba === 'pendentes' && (
                          <button onClick={() => aprovar(p.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                            ✓ Aprovar
                          </button>
                        )}
                        <button onClick={() => verificar(p.id, p.verificado)}
                          className={`flex-1 text-sm font-semibold py-2.5 rounded-xl transition-colors border ${
                            p.verificado
                              ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                          }`}>
                          {p.verificado ? 'Remover verificação' : '★ Verificar'}
                        </button>
                        <button onClick={() => rejeitar(p.id)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                          ✕ Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* DENÚNCIAS */}
            {aba === 'denuncias' && (
              denuncias.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-medium">Nenhuma denúncia!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {denuncias.map(d => (
                    <div key={d.id} className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">🚩 {d.contabilista_nome}</p>
                          <p className="text-xs text-slate-500 mt-1">Motivo: {d.motivo}</p>
                          <p className="text-xs text-slate-300 mt-1">
                            {new Date(d.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={() => apagarDenuncia(d.id)}
                          className="text-xs text-slate-300 hover:text-red-400 px-2 py-1 flex-shrink-0">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* FEEDBACKS */}
            {aba === 'feedbacks' && (
              feedbacks.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="font-medium">Nenhum feedback ainda!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {feedbacks.map(f => (
                    <div key={f.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">
                          {f.tipo === 'sugestao' && '💡'}
                          {f.tipo === 'problema' && '🐛'}
                          {f.tipo === 'elogio' && '❤️'}
                          {f.tipo === 'outro' && '💬'}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              {f.tipo === 'sugestao' && 'Sugestão'}
                              {f.tipo === 'problema' && 'Problema'}
                              {f.tipo === 'elogio' && 'Elogio'}
                              {f.tipo === 'outro' && 'Outro'}
                            </span>
                            <span className="text-xs text-slate-300">
                              {new Date(f.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{f.mensagem}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}