import React, { useState } from 'react';
import { supabase } from './supabase';

const TIPOS = [
  { key: 'sugestao',  label: '💡 Sugestão',         desc: 'Quero propor algo novo' },
  { key: 'problema',  label: '🐛 Problema',          desc: 'Encontrei algo que não funciona' },
  { key: 'elogio',    label: '❤️ Elogio',            desc: 'Quero partilhar algo positivo' },
  { key: 'outro',     label: '💬 Outro',             desc: 'Outra mensagem' },
];

export default function Feedback() {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviar = async () => {
    if (!tipo || !mensagem.trim()) return;
    setEnviando(true);

    await supabase.from('feedbacks').insert([{
      tipo,
      mensagem: mensagem.trim(),
    }]);

    setEnviando(false);
    setEnviado(true);
    setTimeout(() => {
      setAberto(false);
      setEnviado(false);
      setTipo('');
      setMensagem('');
    }, 2500);
  };

  return (
    <>
      {/* Botão flutuante */}
      {!aberto && (
        <button
          onClick={() => setAberto(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
        >
          💬 Dar feedback
        </button>
      )}

      {/* Painel de feedback */}
      {aberto && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">Dar feedback</p>
              <p className="text-blue-200 text-xs mt-0.5">A tua opinião melhora o Me Contrata</p>
            </div>
            <button onClick={() => setAberto(false)} className="text-blue-200 hover:text-white text-xl">✕</button>
          </div>

          <div className="p-5">
            {enviado ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <span className="text-4xl">🙏</span>
                <p className="font-bold text-slate-800 text-center">Obrigado pelo feedback!</p>
                <p className="text-sm text-slate-500 text-center">Vamos usar a tua opinião para melhorar o site.</p>
              </div>
            ) : (
              <>
                {/* Tipo */}
                {!tipo ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-slate-500 mb-1">O que queres partilhar?</p>
                    {TIPOS.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTipo(t.key)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
                      >
                        <span className="text-base">{t.label.split(' ')[0]}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t.label.split(' ').slice(1).join(' ')}</p>
                          <p className="text-xs text-slate-400">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Tipo seleccionado */}
                    <button
                      onClick={() => setTipo('')}
                      className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-3 hover:text-blue-700"
                    >
                      ← {TIPOS.find(t => t.key === tipo)?.label}
                    </button>

                    <p className="text-xs font-medium text-slate-500 mb-2">
                      {tipo === 'sugestao' && 'O que gostavas de ver no Me Contrata?'}
                      {tipo === 'problema' && 'O que não está a funcionar?'}
                      {tipo === 'elogio' && 'O que gostaste?'}
                      {tipo === 'outro' && 'A tua mensagem:'}
                    </p>

                    <textarea
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-28"
                      placeholder="Escreve aqui..."
                      value={mensagem}
                      onChange={e => setMensagem(e.target.value)}
                      autoFocus
                    />

                    <button
                      onClick={enviar}
                      disabled={!mensagem.trim() || enviando}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-3 flex items-center justify-center gap-2"
                    >
                      {enviando ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A enviar...</>
                      ) : 'Enviar feedback'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}