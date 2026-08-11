# 📄 WebPDF

O **WebPDF** é uma aplicação web moderna, rápida e 100% privada para manipulação de arquivos PDF diretamente no navegador. Todos os arquivos são processados localmente no dispositivo do usuário, garantindo total segurança dos dados.

![Versão](https://img.shields.io/badge/version-1.1.0-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🚀 Funcionalidades

- 🧩 **Unir PDFs:** Combine múltiplos arquivos PDF em um único documento.
- ✂️ **Dividir PDF:** Extraia intervalos específicos de páginas com facilidade.
- 🪶 **Comprimir PDF:** Reduza o tamanho de arquivos pesados mantendo a qualidade.
- 📱 **Suporte PWA & Offline:** Instale o app no celular/computador e use mesmo sem acesso à internet.
- 🎨 **Interface Moderna & UX:** Design responsivo no estilo SaaS, com suporte a *Drag & Drop* (arrastar e soltar) e visualização de arquivos selecionados.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3** (Design System customizado com variáveis CSS e ícones SVG)
- **JavaScript (ES6+)**
- **[pdf-lib](https://pdf-lib.js.org/):** Manipulação, junção e divisão de PDFs no client-side.
- **[pdf.js](https://mozilla.github.io/pdf.js/):** Renderização de páginas para compressão.
- **Service Worker & Web App Manifest:** Infraestrutura PWA para cache e funcionamento offline.

---

## 📁 Estrutura do Projeto

```text
WebPDF/
├── index.html      # Estrutura HTML5 da aplicação
├── style.css       # Design System, variáveis CSS e responsividade
├── app.js          # Lógica de manipulação dos PDFs e registro do PWA
├── manifest.json   # Configuração de instalação do PWA (ícones, tema, nome)
├── sw.js           # Service Worker para gerenciamento de cache offline
├── CHANGELOG.md    # Histórico de versões e alterações
└── README.md       # Documentação principal do repositório