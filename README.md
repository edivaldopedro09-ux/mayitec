# 🚀 EDME Solutions — Frontend Workspace

Este repositório aloja uma aplicação frontend de alto desempenho desenvolvida com **React**, **TypeScript** e **Vite**. O projeto foi estruturado seguindo as melhores práticas de arquitetura de software, garantindo modularidade, tipagem estática rigorosa e Hot Module Replacement (HMR) ultra-rápido.

---

## 🧑‍💻 Autor & Liderança Técnica

Este ecossistema foi idealizado, desenhado e implementado por:

*   **Autor:** Edivaldo Pedro
*   **Cargo:** CEO & Lead Software Engineer
*   **Organização:** [EDME Solutions](https://github.com/EDME-Solutions)
*   **Localização:** Luanda, Angola 🇦🇴

<blockquote>
"Transformando linhas de código em soluções tecnológicas robustas, escaláveis e focadas na excelência de experiência do utilizador."
</blockquote>

---

## 🛠️ Stack Tecnológica Central

*   **Core:** React 18+ (Componentização funcional e Hooks avançados)
*   **Linguagem:** TypeScript (Tipagem estática e segurança em tempo de compilação)
*   **Build Tool:** Vite ( bundling de próxima geração com Oxc/SWC)
*   **Estilização:** Tailwind CSS (Utilitários ágeis e design system responsivo)

---

## ⚙️ Configuração de Code Quality & Linters (ESLint)

Para manter o código limpo, padronizado e livre de code smells em ambiente de produção, este projeto utiliza regras estritas e tipadas através do ESLint.

Abaixo está o modelo de configuração estendido (`eslint.config.js`) recomendado para a nossa pipeline de CI/CD:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Regras estritas para TypeScript com verificação de tipos ativa
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      
      // Regras específicas do ecossistema React
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])