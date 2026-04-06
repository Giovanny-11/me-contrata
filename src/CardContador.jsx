import React from 'react';

function getIniciais(nome) {
  return nome
    .split(' ')
    .filter(n => n.length > 0)
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
    <div className="flex items-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'text-amber-400' : 'text-slate-200'} style={{ fontSize: 14 }}>
          ★
        </span>
      ))}
      <span className="text-[11px] font-bold text-slate-500 ml-1.5">{valor.toFixed(1)}</span>
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
  foto_url,
  tipo_servico,
  avaliacao,
  total_avaliacoes,
  verificado,
  isAdmin,
  aoRemover,
}) {
  const servicosFinal = tipo_servico || [];
  
  // Lógica estável para cor do avatar
  const corIndex = nome ? nome.charCodeAt(0) % coresAvatar.length : 0;
  const corAvatar = coresAvatar[corIndex];

  // Criar mensagem personalizada para o WhatsApp
  const mensagem = encodeURIComponent(`Olá ${nome}! Vi o seu perfil no Me Contrata e gostaria de solicitar um orçamento para serviços de contabilidade.`);
  const linkWhatsApp = `https://wa.me/244${whatsapp?.replace(/\s/g, '')}?text=${mensagem}`;

  return (
    <div className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
      
      {/* Background decorativo no hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-5 relative z-10">
        {/* Avatar com fallback de iniciais */}
        <div className={`w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center font-black text-xl shadow-inner ${!foto_url ? corAvatar : ''}`}>
          {foto_url 
            ? <img src={foto_url} alt={nome} className="w-full h-full object-cover" />
            : getIniciais(nome || 'User')
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{nome}</h3>
            {verificado && (
              <span className="inline-flex items-center bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider border border-blue-100">
                <span className="mr-1">✓</span> Verificado
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {especialidade} • <span className="text-blue-600">{experiencia} anos exp.</span>
          </p>

          <Estrelas valor={avaliacao} />
          {total_avaliacoes > 0 && (
            <p className="text-[10px] text-slate-400 font-medium">Baseado em {total_avaliacoes} avaliações</p>
          )}
        </div>
      </div>

      {/* Serviços / Tags */}
      {servicosFinal.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {servicosFinal.slice(0, 4).map(s => (
            <span key={s} className="text-[11px] font-semibold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-100">
              {s}
            </span>
          ))}
          {servicosFinal.length > 4 && (
            <span className="text-[11px] font-bold text-slate-300 py-1.5">+{servicosFinal.length - 4}</span>
          )}
        </div>
      )}

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-50 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Preço Estimado</span>
          <p className="font-black text-slate-800 text-base">{preco}</p>
          <p className="text-xs font-bold text-blue-500 mt-0.5 flex items-center gap-1">
            <span className="text-sm">📍</span> {cidade}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={aoRemover}
              className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Remover perfil"
            >
              ✕
            </button>
          )}
          
          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-green-100 active:scale-95"
          >
            <span>Conversar</span>
            <span className="text-lg">💬</span>
          </a>
        </div>
      </div>
    </div>
  );
}