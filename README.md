# 📄 WebPDF — Processador de PDFs Web

> Uma ferramenta web leve, rápida e 100% client-side para juntar, separar e comprimir arquivos PDF diretamente no navegador.

![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

---

## 🚀 Funcionalidades

- 📑 **Juntar PDFs:** Unifique múltiplos arquivos PDF em um único documento de forma simples e rápida.
- ✂️ **Separar Páginas:** Extraia um intervalo específico de páginas (ex: da página 1 até a 5) de um arquivo PDF.
- 🪶 **Comprimir PDF:** Reduza o tamanho do arquivo reprocessando e otimizando as páginas.

---

## 🛡️ Privacidade e Segurança

Diferente de conversores online tradicionais, **esta ferramenta não envia seus arquivos para nenhum servidor externo**. 

Todo o processamento de leitura, corte, união e download ocorre **100% localmente no seu navegador**. Seus documentos e dados confidenciais nunca saem do seu computador.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3:** Interface limpa, moderna e responsiva.
- **JavaScript (Vanilla):** Lógica da aplicação sem dependência de frameworks pesados.
- **[pdf-lib](https://pdf-lib.js.org/):** Manipulação, criação, união e corte de PDFs no lado do cliente.
- **[pdf.js (Mozilla)](https://mozilla.github.io/pdf.js/):** Renderização de páginas para otimização e compressão.

---

## 📁 Estrutura do Projeto

```text
.
├── index.html     # Estrutura da aplicação e interface
├── style.css      # Estilos visuais e layout responsivo
└── app.js         # Lógica de manipulação dos PDFs e eventos