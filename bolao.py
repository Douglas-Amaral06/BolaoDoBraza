import streamlit as st
import pandas as pd
import os
from datetime import datetime

# ==========================================
# 1. CONFIGURAÇÕES E BRANDING (NEON BRAZIL)
# ==========================================
st.set_page_config(page_title="Bolão do Hexa 🇧🇷", page_icon="🏆", layout="centered")

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');

    .stApp {
        background-color: #0B0E14;
        background: radial-gradient(circle at top center, #0B2516, #050810);
    }
    
    .title-box {
        text-align: center;
        padding: 20px;
        background: linear-gradient(145deg, rgba(0, 255, 65, 0.1), rgba(255, 223, 0, 0.05));
        border-radius: 20px;
        border: 1px solid rgba(0, 255, 65, 0.2);
        box-shadow: 0 10px 30px rgba(0, 255, 65, 0.1);
        margin-bottom: 30px;
    }

    .main-title {
        font-family: 'Poppins', sans-serif;
        color: #FFDF00; /* Amarelo Copa */
        font-size: 3rem;
        font-weight: 900;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 0 15px rgba(255, 223, 0, 0.4);
    }
    
    .sub-title {
        color: #39FF14; /* Verde Neon */
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        letter-spacing: 1px;
    }

    /* Estilo da caixa de Pix */
    .pix-box {
        background: rgba(20, 25, 40, 0.6);
        border-left: 4px solid #39FF14;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 30px;
        text-align: center;
        font-family: 'Poppins', sans-serif;
    }

    .pix-key {
        font-size: 1.5rem;
        color: #FFDF00;
        font-weight: bold;
        background: rgba(0,0,0,0.5);
        padding: 10px;
        border-radius: 8px;
        display: inline-block;
        margin: 10px 0;
        border: 1px dashed rgba(255, 223, 0, 0.3);
    }
    
    /* Inputs customizados */
    div[data-baseweb="input"] input, div[data-baseweb="numberinput"] input {
        background-color: rgba(5, 8, 16, 0.8) !important;
        border: 1px solid rgba(0, 255, 65, 0.3) !important;
        color: #FFF !important;
        font-weight: bold;
    }
    
    div[data-baseweb="input"] input:focus, div[data-baseweb="numberinput"] input:focus {
        border-color: #39FF14 !important;
        box-shadow: 0 0 10px rgba(0, 255, 65, 0.3) !important;
    }

    /* Botão de Envio */
    div[data-testid="stFormSubmitButton"] button {
        background: linear-gradient(90deg, #009c3b, #ffdf00) !important;
        color: #050810 !important;
        font-family: 'Poppins', sans-serif !important;
        font-weight: 900 !important;
        font-size: 1.2rem !important;
        border: none !important;
        transition: all 0.3s ease !important;
        text-transform: uppercase;
        width: 100%;
    }
    
    div[data-testid="stFormSubmitButton"] button:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 10px 20px rgba(0, 255, 65, 0.4) !important;
    }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 2. MOTOR DE DADOS (CSV)
# ==========================================
ARQUIVO_DB = "banco_bolao.csv"

# Se o arquivo não existir, cria a estrutura básica
if not os.path.exists(ARQUIVO_DB):
    df_inicial = pd.DataFrame(columns=["Data", "Nome", "Pix_Premio", "Gols_Brasil", "Gols_Adversario"])
    df_inicial.to_csv(ARQUIVO_DB, index=False)

def carregar_palpites():
    return pd.read_csv(ARQUIVO_DB)

def salvar_palpite(nome, pix, gols_br, gols_adv):
    df = carregar_palpites()
    novo_palpite = pd.DataFrame([{
        "Data": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        "Nome": nome.strip().title(),
        "Pix_Premio": pix.strip(),
        "Gols_Brasil": gols_br,
        "Gols_Adversario": gols_adv
    }])
    df = pd.concat([df, novo_palpite], ignore_ignore=True) if not df.empty else novo_palpite
    df.to_csv(ARQUIVO_DB, index=False)

# ==========================================
# 3. INTERFACE VISUAL (FRONT-END)
# ==========================================

# Header
st.markdown("""
<div class="title-box">
    <h1 class="main-title">🏆 BOLÃO DO HEXA</h1>
    <p class="sub-title">BRASIL x ADVERSÁRIO (FASE DE GRUPOS)</p>
</div>
""", unsafe_allow_html=True)

# Bloco 1: Instruções de Pagamento
st.markdown("""
<div class="pix-box">
    <h3>💰 Valor da Aposta: R$ 10,00</h3>
    <p>Para validar seu palpite, faça o Pix de R$10,00 para a chave abaixo:</p>
    <div class="pix-key">sua-chave-aleatoria-ou-cpf-aqui</div>
    <p style="font-size: 0.8rem; color: #8B9BB4;">O prêmio total será dividido entre os acertadores do placar exato!</p>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

# Bloco 2: Formulário de Palpite
st.subheader("📝 Registre seu Palpite")

with st.form("form_palpite"):
    col1, col2 = st.columns(2)
    with col1:
        nome_apostador = st.text_input("👤 Seu Nome Completo", placeholder="Ex: João da Silva")
    with col2:
        pix_premio = st.text_input("🔑 Sua Chave Pix (Para receber o prêmio)", placeholder="CPF, Celular, E-mail...")
        
    st.markdown("<br><div style='text-align: center;'><h3>⚽ QUAL SERÁ O PLACAR?</h3></div>", unsafe_allow_html=True)
    
    col_br, col_x, col_adv = st.columns([2, 1, 2])
    with col_br:
        gols_brasil = st.number_input("🇧🇷 BRASIL", min_value=0, max_value=20, value=0, step=1)
    with col_x:
        st.markdown("<h1 style='text-align: center; margin-top: 15px; color: #8B9BB4;'>X</h1>", unsafe_allow_html=True)
    with col_adv:
        gols_adversario = st.number_input("🏴 ADVERSÁRIO", min_value=0, max_value=20, value=0, step=1)
        
    st.markdown("<br>", unsafe_allow_html=True)
    submit_button = st.form_submit_button("✅ CONFIRMAR PAGAMENTO E PALPITE")

    if submit_button:
        if not nome_apostador or not pix_premio:
            st.error("⚠️ Preencha seu nome e a sua chave Pix para receber o prêmio!")
        else:
            salvar_palpite(nome_apostador, pix_premio, gols_brasil, gols_adversario)
            st.success(f"🎉 Palpite registrado com sucesso! Boa sorte, {nome_apostador}!")
            st.balloons()

# Bloco 3: Dashboard de Palpites ao Vivo
st.markdown("---")
st.subheader("📊 Palpites Registrados")

df_palpites = carregar_palpites()

if not df_palpites.empty:
    # Cria uma cópia apenas com as colunas que podem ser exibidas publicamente (esconde o Pix e Data)
    df_exibicao = df_palpites[["Nome", "Gols_Brasil", "Gols_Adversario"]].copy()
    
    # Adiciona uma coluna visual de Placar
    df_exibicao["Placar Apostado"] = df_exibicao.apply(lambda row: f"🇧🇷 {row['Gols_Brasil']} x {row['Gols_Adversario']} 🏴", axis=1)
    
    # Exibe a tabela sem as colunas de gols soltas e sem index
    st.dataframe(df_exibicao[["Nome", "Placar Apostado"]], use_container_width=True, hide_index=True)
    
    # Mostra o pote total arrecadado
    valor_pote = len(df_palpites) * 10
    st.info(f"🏆 **Pote Total Atual:** R$ {valor_pote},00 ({len(df_palpites)} apostas)")
else:
    st.info("Nenhum palpite registrado ainda. Seja o primeiro a apostar!")