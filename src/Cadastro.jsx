import React, { useState } from 'react';
import { supabase } from './supabase';

const SERVICOS = [
  { label: "Fecho de contas",              emoji: "📋" },
  { label: "Organização de contabilidade", emoji: "📊" },
  { label: "Declarações fiscais",          emoji: "📄" },
  { label: "Auditoria",                    emoji: "🔍" },
  { label: "Consultoria financeira",       emoji: "💬" },
  { label: "Tempo inteiro",               emoji: "🕐" },
];

const CIDADES = [
  "Luanda", "Benguela", "Huambo", "Lubango", "Malanje",
  "Cabinda", "Namibe", "Uíge", "Soyo", "Outra"
];

function getIniciais(nome) {
  return nome.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function Cadastro({ aoVoltar, aoSalvar }) {
  const [form, setForm] = useState({
    nome: '', especialidade: '', experiencia: '',
    cidade: '', preco: '', whatsapp: '',
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [passo, setPasso] = useState(1);

  const set = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: '' }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErros(prev => ({ ...prev, foto: 'A foto deve ter menos de 2MB.' }));
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDoc = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErros(prev => ({ ...prev, doc: 'O documento deve ter menos de 5MB.' }));
      return;
    }
    setDocFile(file);
    if (erros.doc) setErros(prev => ({ ...prev, doc: '' }));
  };

  const formatarWhatsApp = (valor) => {
    set('whatsapp', valor.replace(/\D/g, '').slice(0, 9));
  };

  const validarPasso1 = () => {
    const novosErros = {};
    if (!form.nome.trim() || form.nome.trim().length < 3)
      novosErros.nome = 'Introduz o nome completo.';
    if (!form.especialidade.trim())
      novosErros.especialidade = 'Indica a tua especialidade.';
    if (!form.experiencia || isNaN(form.experiencia) || Number(form.experiencia) < 0 || Number(form.experiencia) > 50)
      novosErros.experiencia = 'Introduz os anos de experiência (0–50).';
    if (!form.cidade)
      novosErros.cidade = 'Selecciona a tua cidade.';
    if (!form.whatsapp || form.whatsapp.length < 9)
      novosErros.whatsapp = 'Número WhatsApp inválido (9 dígitos).';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const validarPasso2 = () => {
    const novosErros = {};
    if (servicosSelecionados.length === 0)
      novosErros.servicos = 'Selecciona pelo menos um serviço.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const avancar = () => {
    if (validarPasso1()) setPasso(2);
  };

  const handleSubmit = async () => {
    if (!validarPasso2()) return;
    setEnviando(true);

    try {
      let foto_url = null;
      let documento_url = null;

      // Upload foto
      if (fotoFile) {
        const ext = fotoFile.name.split('.').pop();
        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(`${Date.now()}.${ext}`, fotoFile, { contentType: fotoFile.type });
        if (!uploadError) {
          const { data } = supabase.storage.from('fotos').getPublicUrl(`${Date.now()}.${ext}`);
          foto_url = data?.publicUrl;
        }
      }

      // Upload documento
      if (docFile) {
        const ext = docFile.name.split('.').pop();
        const nomeDoc = `${Date.now()}_doc.${ext}`;
        const { error: docError } = await supabase.storage
          .from('documentos')
          .upload(nomeDoc, docFile, { contentType: docFile.type });
        if (!docError) {
          const { data } = supabase.storage.from('documentos').getPublicUrl(nomeDoc);
          documento_url = data?.publicUrl;
        }
      }

      // Inserir na tabela
      const { data, error } = await supabase
        .from('contabilistas')
        .insert([{
          nome: form.nome.trim(),
          especialidade: form.especialidade.trim(),
          experiencia: Number(form.experiencia),
          preco: form.preco.trim() || 'A combinar',
          cidade: form.cidade,
          whatsapp: form.whatsapp,
          foto_url,
          documento_url,
          tipo_servico: servicosSelecionados,
          verificado: false,
          aprovado: false,
          avaliacao: null,
          total_avaliacoes: 0,
        }])
        .select()
        .single();

      if (error) {
        alert('Erro ao criar perfil. Tenta novamente.');
        return;
      }

      aoSalvar(data);
    } catch (err) {
      alert('Erro inesperado. Tenta novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const toggleServico = (label) => {
    setServicosSelecionados(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
    if (erros.servicos) setErros(prev => ({ ...prev, servicos: '' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      <header className="bg-white border-b border-slate-100 shadow-sm px-4 py-4 flex items-center gap-3">
        <button onClick={passo === 2 ? () => setPasso(1) : aoVoltar}
          className="text-slate-500 hover:text-slate-800 transition-colors text-lg font-medium">←</button>
        <div>
          <h1 className="text-base font-bold text-slate-800">Criar perfil</h1>
          <p className="text-xs text-slate-400">Passo {passo} de 2</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          <div className={`h-1.5 w-10 rounded-full transition-colors ${passo >= 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
          <div className={`h-1.5 w-10 rounded-full transition-colors ${passo >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`} />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-6">

        {/* ── PASSO 1 ── */}
        {passo === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <p className="text-sm font-semibold text-slate-700">Informação pessoal</p>

            {/* Foto */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0 overflow-hidden">
                {fotoPreview
                  ? <img src={fotoPreview} alt="foto" className="w-full h-full object-cover" />
                  : <span>{form.nome ? getIniciais(form.nome) : '?'}</span>
                }
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 font-medium border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">
                  📷 {fotoPreview ? 'Alterar foto' : 'Adicionar foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </label>
                <p className="text-xs text-slate-400 mt-1">Opcional · máx. 2MB</p>
                {erros.foto && <p className="text-xs text-red-500 mt-1">{erros.foto}</p>}
              </div>
            </div>

            <Campo label="Nome completo *" erro={erros.nome}
              input={<input className={inputClass(erros.nome)} placeholder="Ex: Simão Bengui Afonso"
                value={form.nome} onChange={e => set('nome', e.target.value)} />}
            />
            <Campo label="Especialidade *" erro={erros.especialidade}
              input={<input className={inputClass(erros.especialidade)} placeholder="Ex: Fiscalidade e IVA"
                value={form.especialidade} onChange={e => set('especialidade', e.target.value)} />}
            />
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Anos de experiência *" erro={erros.experiencia}
                input={<input className={inputClass(erros.experiencia)} placeholder="Ex: 5"
                  type="number" min="0" max="50"
                  value={form.experiencia} onChange={e => set('experiencia', e.target.value)} />}
              />
              <Campo label="Preço mensal"
                input={<input className={inputClass()} placeholder="Ex: 50.000 Kz"
                  value={form.preco} onChange={e => set('preco', e.target.value)} />}
              />
            </div>
            <Campo label="Cidade *" erro={erros.cidade}
              input={
                <select className={inputClass(erros.cidade)} value={form.cidade} onChange={e => set('cidade', e.target.value)}>
                  <option value="">Selecciona a cidade...</option>
                  {CIDADES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              }
            />
            <Campo label="Número WhatsApp *" erro={erros.whatsapp}
              input={
                <div className="flex">
                  <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500">
                    🇦🇴 +244
                  </span>
                  <input
                    className={`flex-1 py-2.5 px-3 border border-slate-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.whatsapp ? 'border-red-400' : ''}`}
                    placeholder="9XXXXXXXX" type="tel"
                    value={form.whatsapp} onChange={e => formatarWhatsApp(e.target.value)}
                  />
                </div>
              }
            />

            {/* Upload documento */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Documento de verificação
              </label>
              <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                docFile ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              }`}>
                <span className="text-xl">{docFile ? '✅' : '📎'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {docFile ? docFile.name : 'Cédula profissional ou carta de curso'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {docFile ? 'Clica para alterar' : 'PDF, JPG ou PNG · máx. 5MB · opcional mas recomendado'}
                  </p>
                </div>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDoc} />
              </label>
              {erros.doc && <p className="text-xs text-red-500 mt-1">{erros.doc}</p>}
              {!docFile && (
                <p className="text-xs text-blue-600 mt-1.5">
                  💡 Perfis com documento verificado aparecem com badge "✓ Verificado"
                </p>
              )}
            </div>

            <button onClick={avancar}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASSO 2 ── */}
        {passo === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0">
                {fotoPreview
                  ? <img src={fotoPreview} alt="foto" className="w-full h-full object-cover" />
                  : getIniciais(form.nome)
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{form.nome}</p>
                <p className="text-xs text-slate-500">{form.especialidade} · {form.cidade}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Que serviços ofereces? *</p>
              <p className="text-xs text-slate-400 mb-3">Selecciona todos os que se aplicam</p>
              <div className="flex flex-col gap-2">
                {SERVICOS.map(s => {
                  const sel = servicosSelecionados.includes(s.label);
                  return (
                    <button key={s.label} onClick={() => toggleServico(s.label)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        sel ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}>
                      <span className="text-base">{s.emoji}</span>
                      <span className="text-sm font-medium flex-1">{s.label}</span>
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        sel ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}>
                        {sel && <span className="text-white text-xs font-bold">✓</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {erros.servicos && <p className="text-xs text-red-500 mt-2">{erros.servicos}</p>}
            </div>

            <button onClick={handleSubmit} disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {enviando ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A guardar...</>
              ) : '✓ Criar perfil'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              O teu perfil ficará visível após revisão da equipa Me Contrata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Campo({ label, erro, input }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {input}
      {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
    </div>
  );
}

function inputClass(erro) {
  return `w-full py-2.5 px-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    erro ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
  }`;
}
