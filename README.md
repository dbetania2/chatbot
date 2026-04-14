# 🤖 Portfolio Chatbot API

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

Una API RESTful construida con Node.js y Express que sirve como el "cerebro" detrás del asistente virtual de mi portfolio profesional. 

Este backend integra Inteligencia Artificial (a través del modelo de Groq) y utiliza un sistema RAG (Retrieval-Augmented Generation) para leer mi currículum en formato Markdown y responder de manera precisa las preguntas de los reclutadores sobre mi experiencia, habilidades y proyectos.

## ✨ Características Principales

* **Integración de IA:** Respuestas rápidas y precisas impulsadas por la API de Groq.
* **Sistema RAG Vectorial:** El bot tiene contexto estricto basado en un archivo `info.md`, asegurando que no alucine información sobre mi perfil.
* **Seguridad de Nivel Producción:**
  * `Helmet` para la protección de cabeceras HTTP.
  * `CORS` configurado para restringir accesos no autorizados.
  * `express-rate-limit` para prevenir ataques de spam y proteger las cuotas de uso de la API (configurado a 5 peticiones por minuto).
* **Testing Automatizado:** Cobertura de pruebas para los endpoints y el limitador de peticiones utilizando `Jest` y `Supertest`.

## 🛠️ Tecnologías Utilizadas

* **Backend:** Node.js, Express
* **IA & Contexto:** LangChain, Groq API
* **Seguridad:** Helmet, CORS, Express Rate Limit
* **Testing:** Jest, Supertest

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/chatbot-portfolio-api.git](https://github.com/tu-usuario/chatbot-portfolio-api.git)
   cd chatbot-portfolio-api