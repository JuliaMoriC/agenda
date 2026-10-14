const STORAGE_KEY = "agendaLilasData";
const initialData = {
  agendamentos: [
    {id:1,data:"2026-10-08T14:00",descricao:"Corte de cabelo",cliente:"Mariana Silva",servico:"Corte Feminino",usuario:"Julia",status:"Confirmado"},
    {id:2,data:"2026-10-08T16:00",descricao:"Barba",cliente:"Carlos Souza",servico:"Barba",usuario:"Pedro",status:"Pendente"},
    {id:3,data:"2026-10-09T10:00",descricao:"Manutenção",cliente:"Ana Lima",servico:"Manutenção",usuario:"Julia",status:"Confirmado"},
    {id:4,data:"2026-10-09T15:00",descricao:"Coloração",cliente:"Beatriz Costa",servico:"Coloração",usuario:"Pedro",status:"Pendente"},
    {id:5,data:"2026-10-10T09:00",descricao:"Limpeza de pele",cliente:"Lucas Almeida",servico:"Limpeza de Pele",usuario:"Julia",status:"Confirmado"}
  ],
  servicos: [
    {id:1,nome:"Corte Feminino",descricao:"Corte de cabelo feminino.",valor:70},
    {id:2,nome:"Corte Masculino",descricao:"Corte de cabelo masculino.",valor:50},
    {id:3,nome:"Barba",descricao:"Design e aparo de barba.",valor:30},
    {id:4,nome:"Coloração",descricao:"Coloração completa dos fios.",valor:120},
    {id:5,nome:"Manutenção",descricao:"Manutenção de corte e acabamento.",valor:80},
    {id:6,nome:"Limpeza de Pele",descricao:"Limpeza de pele facial.",valor:90}
  ],
  clientes: [
    {id:1,nome:"Mariana Silva",telefone:"(16) 99876-5432",email:"mariana@email.com",cidade:"Araraquara",uf:"SP"},
    {id:2,nome:"Carlos Souza",telefone:"(16) 99765-4321",email:"carlos@email.com",cidade:"São Carlos",uf:"SP"},
    {id:3,nome:"Ana Lima",telefone:"(16) 99654-3210",email:"ana@email.com",cidade:"Araraquara",uf:"SP"},
    {id:4,nome:"Beatriz Costa",telefone:"(16) 99543-2109",email:"beatriz@email.com",cidade:"Matão",uf:"SP"},
    {id:5,nome:"Lucas Almeida",telefone:"(16) 99432-1098",email:"lucas@email.com",cidade:"Araraquara",uf:"SP"}
  ],
  usuarios: [
    {id:1,nome:"Julia Mori",email:"julia@email.com",tipoAcesso:"Administrador",status:"Ativo"},
    {id:2,nome:"Pedro Souza",email:"pedro@email.com",tipoAcesso:"Funcionário",status:"Ativo"},
    {id:3,nome:"Ana Carvalho",email:"ana.carvalho@email.com",tipoAcesso:"Funcionário",status:"Ativo"},
    {id:4,nome:"Rafael Silva",email:"rafael@email.com",tipoAcesso:"Recepção",status:"Ativo"},
    {id:5,nome:"Lucas Mendes",email:"lucas@email.com",tipoAcesso:"Funcionário",status:"Inativo"}
  ],
  acessos: [
    {id:1,nome:"Administrador",descricao:"Acesso total ao sistema.",nivel:"Total",status:"Ativo"},
    {id:2,nome:"Funcionário",descricao:"Acesso aos agendamentos, serviços e clientes.",nivel:"Intermediário",status:"Ativo"},
    {id:3,nome:"Recepção",descricao:"Acesso aos agendamentos e clientes.",nivel:"Intermediário",status:"Ativo"},
    {id:4,nome:"Visualizador",descricao:"Visualização de informações, sem edição.",nivel:"Básico",status:"Ativo"}
  ]
};
let data = loadData();
let currentPage = "dashboard";
let editing = null;
let searchTerm = "";

function loadData(){ try { return {...initialData,...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")}; } catch { return structuredClone(initialData); } }
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}
function dateLabel(v){if(!v)return "—";const d=new Date(v);return d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function initials(name=""){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400);}
function nav(){document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===currentPage));}
function heading(title,subtitle,buttonText,buttonAction="new"){return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${buttonText?`<button class="btn btn-primary" data-action="${buttonAction}">＋ ${buttonText}</button>`:""}</div>`;}
function metric(icon,label,value,trend,green=false){return `<article class="metric-card"><div class="metric-icon ${green?"green":""}">${icon}</div><div><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-trend">${trend}</div></div></article>`;}
function statusTag(s){let c=s==="Pendente"?"pending":s==="Cancelado"||s==="Inativo"?"cancelled":"";return `<span class="status ${c}">${esc(s||"Ativo")}</span>`;}
function actions(type,id){return `<div class="actions"><button class="action-btn" title="Editar" data-action="edit" data-type="${type}" data-id="${id}">✎</button><button class="action-btn delete" title="Excluir" data-action="delete" data-type="${type}" data-id="${id}">♜</button></div>`;}
function filterRows(rows){const q=searchTerm.toLowerCase().trim();if(!q)return rows;return rows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q)));}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.join(""):`<tr><td colspan="${headers.length}" class="empty-state">Nenhum registro encontrado.</td></tr>`}</tbody></table></div>`;}
function pagination(){return `<div class="pagination"><div class="page-buttons"><button class="page-btn">‹</button><button class="page-btn active">1</button><button class="page-btn">2</button><button class="page-btn">3</button><span>…</span><button class="page-btn">10</button><button class="page-btn">›</button></div><select class="page-size"><option>10 por página</option><option>25 por página</option><option>50 por página</option></select></div>`;}
function filters(placeholder,extra=""){return `<div class="filters"><input class="field-control search-field page-search" placeholder="${placeholder}" value="${esc(searchTerm)}">${extra}</div>`;}
function dashboard(){
 const faturamento=data.agendamentos.reduce((sum,a)=>sum+(data.servicos.find(s=>s.nome===a.servico)?.valor||0),0);
 const chart=[3,7,4,6,2,5,3], days=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
 const bars=chart.map((n,i)=>`<div class="chart-col"><div class="bar" style="height:${n/8*100}%"></div><span>${days[i]}</span></div>`).join("");
 const topServices=data.servicos.slice(0,5).map((s,i)=>{let n=data.agendamentos.filter(a=>a.servico===s.nome||a.descricao===s.nome).length;return `<div class="service-bar-row"><span>${esc(s.nome)}</span><div class="service-bar-track"><div class="service-bar-fill" style="width:${Math.max(8,(n||[6,4,3,2,1][i])*14)}%"></div></div><span>${n||[6,4,3,2,1][i]}</span></div>`}).join("");
 const rows=filterRows(data.agendamentos).slice(0,5).map(a=>`<tr><td>${dateLabel(a.data)}</td><td>${esc(a.cliente)}</td><td>${esc(a.servico)}</td><td>${esc(a.usuario)}</td><td>${statusTag(a.status)}</td><td>${actions("agendamentos",a.id)}</td></tr>`);
 const recent=data.clientes.slice(0,5).map(c=>`<div class="recent-client"><div class="avatar">${initials(c.nome)}</div><div><strong>${esc(c.nome)}</strong><span>${esc(c.telefone)}</span></div><small>Recente</small></div>`).join("");
 return `${heading("Dashboard","Visão geral do sistema","","")}
 <div class="metrics">${metric("▣","Agendamentos",data.agendamentos.length,"↑ Agenda atual")}${metric("♙","Clientes",data.clientes.length,"↑ Base cadastrada")}${metric("⚒","Serviços",data.servicos.length,"↑ Serviços ativos")}${metric("$","Faturamento Previsto",money(faturamento),"↑ Conforme agenda",true)}</div>
 <div class="dashboard-grid"><section class="panel"><h3 class="panel-title">Agendamentos da Semana <button class="text-link" data-page-link="agendamentos">Ver todos →</button></h3><div class="chart">${bars}</div></section><section class="panel"><h3 class="panel-title">Serviços mais agendados</h3><div class="service-bars">${topServices}</div></section></div>
 <div class="dashboard-grid"><section class="panel table-panel"><h3 class="panel-title">Próximos Agendamentos <button class="text-link" data-page-link="agendamentos">Ver todos →</button></h3>${table(["Data e Horário","Cliente","Serviço","Usuário","Status","Ações"],rows)}</section><section class="panel"><h3 class="panel-title">Clientes recentes <button class="text-link" data-page-link="clientes">Ver todos →</button></h3><div class="recent-list">${recent}</div></section></div>`;
}
function listingPage(type){
 const configs={
 agendamentos:{title:"Agendamentos",sub:"Gerencie os agendamentos de serviços",button:"Novo Agendamento",placeholder:"Buscar por cliente, serviço ou descrição...",headers:["Data e Horário","Descrição","Cliente","Serviço","Usuário","Status","Ações"],rows:r=>[dateLabel(r.data),r.descricao,r.cliente,r.servico,r.usuario,statusTag(r.status),actions(type,r.id)],fields:[["descricao","Descrição","text",true],["data","Data e horário","datetime-local",true],["servico","Serviço","select",true],["cliente","Cliente","select",true],["usuario","Usuário","select",true],["status","Status","select",true]]},
 servicos:{title:"Serviços",sub:"Gerencie os serviços oferecidos",button:"Novo Serviço",placeholder:"Buscar por nome ou descrição...",headers:["ID","Nome","Descrição","Valor (R$)","Ações"],rows:r=>[r.id,r.nome,r.descricao,money(r.valor),actions(type,r.id)],fields:[["nome","Nome","text",true],["descricao","Descrição","text",true],["valor","Valor (R$)","number",true]]},
 clientes:{title:"Clientes",sub:"Gerencie os clientes cadastrados",button:"Novo Cliente",placeholder:"Buscar por nome, telefone ou e-mail...",headers:["ID","Nome","Telefone","E-mail","Cidade","Ações"],rows:r=>[r.id,`<span class="name-cell"><span class="mini-avatar">${initials(r.nome)}</span>${esc(r.nome)}</span>`,r.telefone,r.email,`${esc(r.cidade||"—")}${r.uf?", "+esc(r.uf):""}`,actions(type,r.id)],fields:[["nome","Nome","text",true],["telefone","Telefone","tel",true],["email","E-mail","email",true],["logradouro","Logradouro","text",false],["numero","Número","text",false],["complemento","Complemento","text",false],["cidade","Cidade","text",true],["uf","UF","text",true],["cep","CEP","text",false]]},
 usuarios:{title:"Usuários",sub:"Gerencie os usuários do sistema",button:"Novo Usuário",placeholder:"Buscar por nome ou e-mail...",headers:["ID","Nome","E-mail","Tipo de Acesso","Status","Ações"],rows:r=>[r.id,`<span class="name-cell"><span class="mini-avatar">${initials(r.nome)}</span>${esc(r.nome)}</span>`,r.email,`<span class="role-badge">${esc(r.tipoAcesso)}</span>`,statusTag(r.status),actions(type,r.id)],fields:[["nome","Nome","text",true],["email","E-mail","email",true],["senha","Senha","password",true],["tipoAcesso","Tipo de acesso","select",true],["status","Status","select",true]]},
 acessos:{title:"Tipos de Acesso",sub:"Gerencie os tipos de acesso do sistema",button:"Novo Tipo de Acesso",placeholder:"Buscar por nome ou descrição...",headers:["ID","Nome","Descrição","Nível de Acesso","Status","Ações"],rows:r=>[r.id,`<span class="name-cell"><span class="mini-avatar">♙</span>${esc(r.nome)}</span>`,r.descricao,`<span class="role-badge">${esc(r.nivel)}</span>`,statusTag(r.status),actions(type,r.id)],fields:[["nome","Nome","text",true],["descricao","Descrição","text",true],["nivel","Nível de acesso","select",true],["status","Status","select",true]]}
 };
 const c=configs[type];let rows=filterRows(data[type]).map(r=>`<tr>${c.rows(r).map((v,i)=>`<td>${v??"—"}</td>`).join("")}</tr>`);
 let extra=type==="agendamentos"?`<select class="field-control"><option>Todos os períodos</option><option>Esta semana</option><option>Este mês</option></select><select class="field-control"><option>Todos os status</option><option>Confirmado</option><option>Pendente</option><option>Cancelado</option></select>`:type==="clientes"?`<select class="field-control"><option>Todas as cidades</option><option>Araraquara</option><option>São Carlos</option><option>Matão</option></select>`:type==="usuarios"||type==="acessos"?`<select class="field-control"><option>Todos os status</option><option>Ativo</option><option>Inativo</option></select>`:"";
 return `${heading(c.title,c.sub,c.button)}<section class="panel table-panel">${filters(c.placeholder,extra)}${table(c.headers,rows)}${pagination()}</section>`;
}
function render(){nav();const root=document.getElementById("pageContent");root.innerHTML=currentPage==="dashboard"?dashboard():listingPage(currentPage);document.querySelectorAll("[data-page-link]").forEach(b=>b.onclick=()=>go(b.dataset.pageLink));}
function go(page){currentPage=page;searchTerm="";document.getElementById("globalSearch").value="";render();}
const selectOptions={
 servico:()=>data.servicos.map(x=>x.nome),cliente:()=>data.clientes.map(x=>x.nome),usuario:()=>data.usuarios.map(x=>x.nome),status:()=>["Confirmado","Pendente","Cancelado"],tipoAcesso:()=>data.acessos.map(x=>x.nome),nivel:()=>["Básico","Intermediário","Avançado","Total"]
};
const fieldsByType={
 agendamentos:[["descricao","Descrição","text",true],["data","Data e horário","datetime-local",true],["servico","Serviço","select",true],["cliente","Cliente","select",true],["usuario","Usuário","select",true],["status","Status","select",true]],
 servicos:[["nome","Nome","text",true],["descricao","Descrição","text",true],["valor","Valor (R$)","number",true]],
 clientes:[["nome","Nome","text",true],["telefone","Telefone","tel",true],["email","E-mail","email",true],["logradouro","Logradouro","text",false],["numero","Número","text",false],["complemento","Complemento","text",false],["cidade","Cidade","text",true],["uf","UF","text",true],["cep","CEP","text",false]],
 usuarios:[["nome","Nome","text",true],["email","E-mail","email",true],["senha","Senha","password",false],["tipoAcesso","Tipo de acesso","select",true],["status","Status","select",true]],
 acessos:[["nome","Nome","text",true],["descricao","Descrição","text",true],["nivel","Nível de acesso","select",true],["status","Status","select",true]]
};
function openModal(type,id=null){editing=id===null?null:{type,id};const item=id===null?{}:data[type].find(x=>x.id===id)||{};const labels={agendamentos:"Agendamento",servicos:"Serviço",clientes:"Cliente",usuarios:"Usuário",acessos:"Tipo de Acesso"};document.getElementById("modalTitle").textContent=(id===null?"Novo ":"Editar ")+labels[type];document.getElementById("modalSubtitle").textContent=id===null?"Preencha os dados abaixo":"Atualize as informações do cadastro";
 const fields=fieldsByType[type];document.getElementById("formFields").innerHTML=fields.map(([key,label,inputType,required])=>{let val=item[key]??"";if(key==="senha"&&id!==null)val="";let control;if(inputType==="select"){let options=selectOptions[key]?.()||[];control=`<select class="form-control" name="${key}" ${required?"required":""}><option value="">Selecione...</option>${options.map(o=>`<option ${String(val)===String(o)?"selected":""}>${esc(o)}</option>`).join("")}</select>`;}else control=`<input class="form-control" name="${key}" type="${inputType}" value="${esc(val)}" ${required?"required":""} ${inputType==="number"?'min="0.01" step="0.01"':""} ${key==="data"?'min="'+new Date().toISOString().slice(0,16)+'"':""}>`;return `<label class="form-field ${["descricao","email","logradouro"].includes(key)&&type==="clientes"?"":""}">${label}${required?' <span style="color:#d94a70">*</span>':""}${control}</label>`;}).join("");
 document.getElementById("modalBackdrop").hidden=false;document.querySelector("#formFields input, #formFields select")?.focus();
}
function closeModal(){document.getElementById("modalBackdrop").hidden=true;document.getElementById("entityForm").reset();editing=null;}
function saveForm(e){e.preventDefault();const type=editing?.type||currentPage;if(!data[type])return;const form=new FormData(e.target);const obj={};for(const [k,v] of form.entries())obj[k]=v.trim();if(type==="servicos")obj.valor=Number(obj.valor);if(type==="agendamentos"){if(new Date(obj.data)<new Date(new Date().toDateString())){toast("Escolha uma data futura.");return;}if(data.agendamentos.some(a=>a.id!==editing?.id&&a.usuario===obj.usuario&&a.data===obj.data)){toast("Este usuário já possui agendamento nesse horário.");return;}}if(type==="clientes"){if(data.clientes.some(c=>c.id!==editing?.id&&c.email.toLowerCase()===obj.email.toLowerCase())){toast("Já existe um cliente com este e-mail.");return;}if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(obj.email)){toast("Informe um e-mail válido.");return;}}if(type==="servicos"&&obj.valor<=0){toast("O valor deve ser maior que zero.");return;}if(editing){const idx=data[type].findIndex(x=>x.id===editing.id);data[type][idx]={...data[type][idx],...obj};}else{obj.id=Math.max(0,...data[type].map(x=>Number(x.id)||0))+1;data[type].unshift(obj);}persist();closeModal();render();toast(editing?"Cadastro atualizado!":"Cadastro salvo!");}
function deleteItem(type,id){const item=data[type].find(x=>x.id===Number(id));if(!item)return;if(type==="servicos"&&data.agendamentos.some(a=>a.servico===item.nome)){toast("Não é possível excluir um serviço vinculado a agendamentos.");return;}if(type==="clientes"&&data.agendamentos.some(a=>a.cliente===item.nome)){toast("Não é possível excluir um cliente com agendamentos.");return;}if(!confirm("Deseja realmente excluir este registro?"))return;data[type]=data[type].filter(x=>x.id!==Number(id));persist();render();toast("Registro excluído.");}
document.getElementById("navigation").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)go(b.dataset.page);});
document.getElementById("pageContent").addEventListener("click",e=>{const action=e.target.closest("[data-action]");if(action){const type=action.dataset.type||currentPage;if(action.dataset.action==="new")openModal(currentPage);if(action.dataset.action==="edit")openModal(type,Number(action.dataset.id));if(action.dataset.action==="delete")deleteItem(type,action.dataset.id);}const page=e.target.closest("[data-page-link]");if(page)go(page.dataset.pageLink);});
document.getElementById("pageContent").addEventListener("input",e=>{if(e.target.matches(".page-search")){searchTerm=e.target.value;const pos=e.target.selectionStart;render();const next=document.querySelector(".page-search");if(next){next.focus();next.setSelectionRange(pos,pos);}}});
document.getElementById("globalSearch").addEventListener("input",e=>{searchTerm=e.target.value;render();});
document.getElementById("entityForm").addEventListener("submit",saveForm);
document.getElementById("closeModal").onclick=closeModal;document.getElementById("cancelModal").onclick=closeModal;
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
render();
