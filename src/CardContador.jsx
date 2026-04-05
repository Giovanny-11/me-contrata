import React from 'react';

function getIniciais(nome) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
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
    <div className="flex items-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'text-amber-400' : 'text-slate-200'} style={{ fontSize: 13 }}>
          ★
        </span>
      ))}
      <span className="text-xs text-slate-400 ml-1">{valor.toFixed(1)}</span>
    </div>
  );
}

export default function CardContador({
  id,
  nome,
  experiencia,
  especialidade,
  preco,
  cidade,
  whatsapp,
  foto,
  tipoServico,
  avaliacao,
  totalAvaliacoes,
  verificado,
  aoRemover,
}) {
  const corAvatar = coresAvatar[id % coresAvatar.length];
  const linkWhatsApp = `https://wa.me/244${whatsapp}`;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">

      {/* Topo: avatar + info principal */}
      <div className="flex items-start gap-4 mb-4">

        {/* Avatar com foto ou iniciais */}
        <div className={`w-12 h-12 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-semibold text-sm ${!foto ? corAvatar : ''}`}>
          {foto
            ? <img src={foto} alt={nome} className="w-full h-full object-cover" />
            : getIniciais(nome)
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-base">{nome}</h3>
            {verificado && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                ✓ Verificado
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mt-0.5">
            {especialidade} · {experiencia} ano{experiencia !== 1 ? 's' : ''} exp.
          </p>

          {avaliacao && (
            <div className="flex items-center gap-1.5 mt-1">
              <Estrelas valor={avaliacao} />
              {totalAvaliacoes > 0 && (
                <span className="text-xs text-slate-400">({totalAvaliacoes} avaliações)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tags de serviços */}
      {tipoServico && tipoServico.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tipoServico.map(s => (
            <span
              key={s}
              className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Rodapé: preço + cidade + acções */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{preco}</p>
          <p className="text-xs text-slate-400 mt-0.5">📍 {cidade}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            💬 WhatsApp
          </a>
          <button
            onClick={aoRemover}
            className="text-xs text-slate-300 hover:text-red-400 transition-colors px-2 py-2"
            title="Remover"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
