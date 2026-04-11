import React, { useState } from 'react';
import { supabase } from './supabase';

function getIniciais(nome) {
  return nome ? nome.split(' ').filter(n => n.length > 0).slice(0, 2).map(n => n[0]).join('').toUpperCase() : '??';
}

const coresAvatar = [
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-purple-100 text-purple-700',
];

function Estrelas({ valor }) {
  if (!valor) return null;
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'text-amber-400' : 'text-slate-200'} style={{ fontSize: 14 }}>★</span>
      ))}
      <span className="text-[11px] font-bold text-slate-500 ml-1.5">{Number(valor).toFixed(1)}</span>
    </div>
  );
}

function EstrelasInteractivas({ valor, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={(hover || valor) >= i ? 'text-amber-400' : 'text-slate-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

const MOTIVOS_DENUNCIA = [
  'Perfil falso ou enganoso',
  'Informação incorrecta',
  'Comportamento inadequado',
  'Outro',
];

export default function CardContador({
  id, nome, experiencia, especialidade, preco, cidade, whatsapp,
  foto_url, tipo_servico, avaliacao, total_avaliacoes, verificado,
  isAdmin, aoRemover,
}) {
  const [painel, setPainel] = useState(null); // null | 'avaliar' | 'denunciar'

  // estado avaliação
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviandoAv, setEnviandoAv] = useState(false);
  const [avEnviada, setAvEnviada] = useState(false);

  // estado avaliação local (actualiza sem recarregar)
  const [avaliacaoLocal, setAvaliacaoLocal] = useState(avaliacao);
  const [totalLocal, setTotalLocal] = useState(total_avaliacoes || 0);

  // estado denúncia
  const [motivoDenuncia, setMotivoDenuncia] = useState('');
  const [enviandoDen, setEnviandoDen] = useState(false);
  const [denEnviada, setDenEnviada] = useState(false);

  const servicosFinal = tipo_servico || [];
  const corIndex = nome ? nome.charCodeAt(0) % coresAvatar.length : 0;
  const msgCliente = encodeURIComponent(`Olá ${nome}, vi o seu perfil no Me Contrata e gostaria de saber mais sobre os seus serviços.`);
  const linkWhatsApp = `https://wa.me/244${whatsapp?.replace(/\s/g, '')}?text=${msgCliente}`;

  const enviarAvaliacao = async () => {
    if (estrelas === 0) return;
    setEnviandoAv(true);

    const { error } = await supabase.from('avaliacoes').insert([{
      contabilista_id: id,
      estrelas,
      comentario: comentario.trim() || null,
    }]);

    if (!error) {
      // actualiza a média localmente
      const novoTotal = totalLocal + 1;
      const novaMedia = ((avaliacaoLocal || 0) * totalLocal + estrelas) / novoTotal;
      setAvaliacaoLocal(novaMedia);
      setTotalLocal(novoTotal);

      // actualiza na base de dados
      await supabase.from('contabilistas').update({
        avaliacao: novaMedia,
        total_avaliacoes: novoTotal,
      }).eq('id', id);

      setAvEnviada(true);
      setTimeout(() => {
        setPainel(null);
        setAvEnviada(false);
        setEstrelas(0);
        setComentario('');
      }, 2000);
    }
    setEnviandoAv(false);
  };

  const enviarDenuncia = async () => {
    if (!motivoDenuncia) return;
    setEnviandoDen(true);
    await supabase.from('denuncias').insert([{
      contabilista_id: id,
      contabilista_nome: nome,
      motivo: motivoDenuncia,
    }]);
    setEnviandoDen(false);
    setDenEnviada(true);
    setTimeout(() => {
      setPainel(null);
      setDenEnviada(false);
      setMotivoDenuncia('');
    }, 2000);
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative">

      {/* Botão admin ou denúncia */}
      <div className="absolute top-4 right-4">
        {isAdmin ? (
          <button onClick={aoRemover} className="text-slate-300 hover:text-red-500 p-2 text-xl" title="Apagar">✕</button>
        ) : (
          <button onClick={() => setPainel(painel === 'denunciar' ? null : 'denunciar')}
            className="text-[10px] font-bold text-slate-300 hover:text-red-400 uppercase tracking-tighter">
            🚩 Denunciar
          </button>
        )}
      </div>

      {/* Info principal */}
      <div className="flex items-start gap-5">
        <div className={`w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center font-black text-xl ${!foto_url ? coresAvatar[corIndex] : ''}`}>
          {foto_url
            ? <img src={foto_url} alt={nome} className="w-full h-full object-cover" />
            : getIniciais(nome)
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-lg">{nome}</h3>
            {verificado && <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">✓ Verificado</span>}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {especialidade} • <span className="text-blue-600">{experiencia} anos exp.</span>
          </p>
          {avaliacaoLocal ? (
            <div className="flex items-center gap-2 mt-1">
              <Estrelas valor={avaliacaoLocal} />
              <span className="text-xs text-slate-400">({totalLocal} avaliação{totalLocal !== 1 ? 'ões' : ''})</span>
            </div>
          ) : (
            <p className="text-xs text-slate-300 mt-1">Sem avaliações ainda</p>
          )}
        </div>
      </div>

      {/* Tags de serviços */}
      <div className="flex flex-wrap gap-2 mt-5">
        {servicosFinal.slice(0, 4).map(s => (
          <span key={s} className="text-[11px] font-semibold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100">{s}</span>
        ))}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-50">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço Estimado</span>
          <p className="font-black text-slate-800 text-base">{preco}</p>
          <p className="text-xs font-bold text-blue-500 mt-0.5">📍 {cidade}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPainel(painel === 'avaliar' ? null : 'avaliar')}
            className="text-xs font-semibold text-amber-500 hover:text-amber-600 border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl transition-colors"
          >
            ⭐ Avaliar
          </button>
          <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-md">
            Conversar 💬
          </a>
        </div>
      </div>

      {/* ── PAINEL DE AVALIAÇÃO ── */}
      {painel === 'avaliar' && (
        <div className="absolute inset-0 bg-white rounded-3xl p-6 flex flex-col z-10 border border-amber-100">
          {avEnviada ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <span className="text-4xl">🎉</span>
              <p className="font-bold text-slate-800">Obrigado pela avaliação!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-800">Avaliar {nome}</p>
                <button onClick={() => setPainel(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>

              <p className="text-xs text-slate-500 mb-3">Como foi a tua experiência?</p>

              <div className="flex justify-center mb-4">
                <EstrelasInteractivas valor={estrelas} onChange={setEstrelas} />
              </div>

              {estrelas > 0 && (
                <div className="text-center text-sm font-medium text-amber-600 mb-3">
                  {['', 'Muito mau 😞', 'Mau 😐', 'Razoável 🙂', 'Bom 😊', 'Excelente 🌟'][estrelas]}
                </div>
              )}

              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none flex-1 min-h-[80px]"
                placeholder="Deixa um comentário (opcional)..."
                value={comentario}
                onChange={e => setComentario(e.target.value)}
              />

              <button
                onClick={enviarAvaliacao}
                disabled={estrelas === 0 || enviandoAv}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-3 flex items-center justify-center gap-2"
              >
                {enviandoAv ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A enviar...</>
                ) : 'Enviar avaliação'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── PAINEL DE DENÚNCIA ── */}
      {painel === 'denunciar' && (
        <div className="absolute inset-0 bg-white rounded-3xl p-6 flex flex-col z-10 border border-red-100">
          {denEnviada ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <span className="text-4xl">✅</span>
              <p className="font-bold text-slate-800 text-center">Denúncia enviada!</p>
              <p className="text-sm text-slate-500 text-center">A equipa Me Contrata vai analisar este perfil.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-800">Denunciar perfil</p>
                <button onClick={() => setPainel(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
              <p className="text-xs text-slate-500 mb-3">Qual é o motivo da denúncia?</p>
              <div className="flex flex-col gap-2 flex-1">
                {MOTIVOS_DENUNCIA.map(m => (
                  <button key={m} onClick={() => setMotivoDenuncia(m)}
                    className={`text-left text-sm px-4 py-2.5 rounded-xl border transition-all ${
                      motivoDenuncia === m
                        ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={enviarDenuncia} disabled={!motivoDenuncia || enviandoDen}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2">
                {enviandoDen ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A enviar...</>
                ) : 'Enviar denúncia'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
