# ⚡ SUPER MALHAS

### Simulador de Análise de Circuitos Elétricos

![Status](https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Typescript](https://img.shields.io/badge/Typescript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

</div>

## 🎯 Visão Geral

O **Super Malhas** é um simulador completo para **análise de circuitos elétricos** usando:

- Método de **Análise de Malhas**
- Leis de **Kirchhoff**
- Resolução matricial do tipo:

\[
R \cdot I = V
\]

Criado como ferramenta didática em **Circuitos Elétricos I – IFMT**, suporta até **6 malhas**, solucionando automaticamente sistemas lineares complexos.

---

## 🌟 Recursos Principais

### ✅ Métodos Matemáticos Avançados

- Método de **Cramer**
- **Decomposição LU** (fallback automático)
- Verificação de determinante e estabilidade numérica

### ✅ Entrada Matemática Flexible

- Aceita expressões como:
  - `"sqrt(4)"`
  - `"2+5"`
  - `"3*(10-2)"`
- Avaliação via **math.js**

### ✅ Relatório de Cálculo Completo

- Equações de malha geradas automaticamente
- Forma matricial
- Solução passo a passo
- Correntes convertidas automaticamente:
  **A**, **mA**, **µA**, **kA**

### ✅ Interface Moderna

- React + Tailwind
- Componentes responsivos
- Foco na experiência do aluno

---

## 🚀 Tecnologias

| Categoria              | Tecnologias              |
| ---------------------- | ------------------------ |
| **Frontend**           | React, Vite, Tailwind    |
| **Backend**            | Express, TypeScript, tsx |
| **Cálculo Matemático** | math.js                  |
| **ORM / Banco**        | Drizzle ORM              |
| **Build/Dev**          | Vite, tsx, Node.js       |

---

## 🖥 Prévia da Interface

> **📌 Adicione aqui prints do sistema.**  
> Se quiser, posso editar as imagens para padrão GitHub com sombra e moldura.
> ![alt text](image.png) > ![alt text](image-1.png) > ![alt text](image-2.png) > ![alt text](image-3.png) > ![alt text](image-4.png) > ![alt text](image-5.png)

---

## ⚙️ Como Rodar o Projeto

### 1️⃣ Instale as dependências

```bash
npm install
```

2️⃣ Execute Backend e Frontend

Use dois terminais:
| Terminal | Comando | Porta | Descrição |
| -------- | -------------------- | ----- | ------------------- |
| 1 | `npm run dev` | 5001 | Backend Express |
| 2 | `npm run dev:client` | 5000 | Frontend React/Vite |
Acesse no navegador:

👉 http://localhost:5000

📦 Scripts Disponíveis
npm run dev # Backend dev
npm run dev:client # Frontend dev
npm run build # Compila tudo
npm run start # Inicia produção
npm run check # Verifica TS
npm run db:push # Atualiza banco (Drizzle)
🧠 Arquitetura do Projeto
SuperMalhas/
├─ server/
│ ├─ index.ts
│ ├─ routes/
│ └─ controllers/
├─ client/
│ ├─ src/
│ │ ├─ components/
│ │ ├─ pages/
│ │ └─ hooks/
├─ shared/
├─ drizzle/
└─ package.json

🎓 Créditos

Desenvolvedora: Loren Pires
Disciplina: Circuitos Elétricos 1
Orientador: Prof. Guilherme Barros Seixas
Instituição: IFMT – Campus Cuiabá
