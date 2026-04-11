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
      <span className="text-[11px] font-bold text-slate-500 ml-1.5">{valor.toFixed(1)}</span>
    </div>
  );
}

const MOTIVOS = [
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
  const [mostrarDenuncia, setMostrarDenuncia] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false);
  const [denunciaEnviada, setDenunciaEnviada] = useState(false);

  const servicosFinal = tipo_servico || [];
  const corIndex = nome ? nome.charCodeAt(0) % coresAvatar.length : 0;
  const msgCliente = encodeURIComponent(`Olá ${nome}, vi o seu perfil no Me Contrata e gostaria de saber mais sobre os seus serviços.`);
  const linkWhatsApp = `https://wa.me/244${whatsapp?.replace(/\s/g, '')}?text=${msgCliente}`;

  const enviarDenuncia = async () => {
    if (!motivoSelecionado) return;
    setEnviandoDenuncia(true);
    await supabase.from('denuncias').insert([{
      contabilista_id: id,
      contabilista_nome: nome,
      motivo: motivoSelecionado,
    }]);
    setEnviandoDenuncia(false);
    setDenunciaEnviada(true);
    setTimeout(() => {
      setMostrarDenuncia(false);
      setDenunciaEnviada(false);
      setMotivoSelecionado('');
    }, 2000);
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative">

      {/* Botão admin ou denúncia */}
      <div className="absolute top-4 right-4">
        {isAdmin ? (
          <button onClick={aoRemover} className="text-slate-300 hover:text-red-500 p-2 text-xl" title="Apagar">✕</button>
        ) : (
          <button
            onClick={() => setMostrarDenuncia(true)}
            className="text-[10px] font-bold text-slate-300 hover:text-red-400 uppercase tracking-tighter"
          >
            🚩 Denunciar
          </button>
        )}
      </div>

      {/* Card principal */}
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
            {verificado && (
              <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">✓ Verificado</span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {especialidade} • <span className="text-blue-600">{experiencia} anos exp.</span>
          </p>
          <Estrelas valor={avaliacao} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {servicosFinal.slice(0, 4).map(s => (
          <span key={s} className="text-[11px] font-semibold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100">{s}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-50">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço Estimado</span>
          <p className="font-black text-slate-800 text-base">{preco}</p>
          <p className="text-xs font-bold text-blue-500 mt-0.5">📍 {cidade}</p>
        </div>
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-md"
        >
          Conversar 💬
        </a>
      </div>

      {/* Modal de denúncia */}
      {mostrarDenuncia && (
        <div className="absolute inset-0 bg-white rounded-3xl p-6 flex flex-col justify-between z-10 border border-red-100">
          {denunciaEnviada ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="text-4xl">✅</span>
              <p className="font-bold text-slate-800 text-center">Denúncia enviada!</p>
              <p className="text-sm text-slate-500 text-center">A equipa Me Contrata vai analisar este perfil.</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-slate-800">Denunciar perfil</p>
                  <button onClick={() => setMostrarDenuncia(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                </div>
                <p className="text-xs text-slate-500 mb-3">Qual é o motivo da denúncia?</p>
                <div className="flex flex-col gap-2">
                  {MOTIVOS.map(m => (
                    <button
                      key={m}
                      onClick={() => setMotivoSelecionado(m)}
                      className={`text-left text-sm px-4 py-2.5 rounded-xl border transition-all ${
                        motivoSelecionado === m
                          ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={enviarDenuncia}
                disabled={!motivoSelecionado || enviandoDenuncia}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2"
              >
                {enviandoDenuncia ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> A enviar...</>
                ) : 'Enviar denúncia'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
