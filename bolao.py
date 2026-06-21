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

    /* Força o fundo escuro e blinda contra o Light Mode do celular */
    .stApp {
        background-color: #0B0E14 !important;
        background: radial-gradient(circle at top center, #0B2516, #050810) !important;
        color: #FFFFFF !important;
    }
    
    /* Box do Título com animação Hover */
    .title-box {
        text-align: center;
        padding: 20px;
        background: linear-gradient(145deg, rgba(0, 255, 65, 0.1), rgba(255, 223, 0, 0.05));
        border-radius: 20px;
        border: 1px solid rgba(0, 255, 65, 0.2);
        box-shadow: 0 10px 30px rgba(0, 255, 65, 0.1);
        margin-bottom: 30px;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .title-box:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 15px 35px rgba(0, 255, 65, 0.2);
        border-color: #39FF14;
    }

    .main-title {
        font-family: 'Poppins', sans-serif;
        color: #FFDF00 !important; 
        font-size: 3.2rem;
        font-weight: 900;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 0 15px rgba(255, 223, 0, 0.4);
    }
    
    .sub-title {
        color: #39FF14 !important; 
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        letter-spacing: 1px;
    }

    /* Animação Hover no Formulário Nativo do Streamlit e Força Texto Branco */
    [data-testid="stForm"] {
        transition: all 0.3s ease-in-out;
        background-color: rgba(20, 25, 40, 0.3) !important;
        border: 1px solid rgba(0, 255, 65, 0.15) !important;
        border-radius: 15px;
        padding: 20px;
    }
    [data-testid="stForm"] p, [data-testid="stForm"] label {
        color: #FFFFFF !important;
    }
    [data-testid="stForm"]:hover {
        transform: scale(1.02);
        box-shadow: 0 10px 30px rgba(57, 255, 20, 0.15);
        border-color: #39FF14 !important;
    }

    /* Estilo e Animação da Caixa de Pix */
    .pix-box {
        background: rgba(20, 25, 40, 0.6) !important;
        border-left: 4px solid #39FF14 !important;
        padding: 25px;
        border-radius: 15px;
        margin-bottom: 30px;
        text-align: center;
        font-family: 'Poppins', sans-serif;
        transition: all 0.3s ease-in-out;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .pix-box p {
        color: #E2E8F0 !important;
    }
    .pix-box:hover {
        transform: scale(1.02);
        box-shadow: 0 10px 30px rgba(255, 223, 0, 0.15);
        border-left-color: #FFDF00 !important;
    }

    .pix-key {
        font-size: 1.4rem;
        color: #FFDF00 !important;
        font-weight: bold;
        background: rgba(0,0,0,0.5) !important;
        padding: 12px;
        border-radius: 8px;
        display: inline-block;
        margin: 15px 0;
        border: 1px dashed rgba(255, 223, 0, 0.3) !important;
        word-break: break-all;
    }
    
    /* Inputs customizados cegos contra Light Mode */
    div[data-baseweb="input"] input, div[data-baseweb="numberinput"] input {
        background-color: rgba(5, 8, 16, 0.8) !important;
        border: 1px solid rgba(0, 255, 65, 0.3) !important;
        color: #FFFFFF !important;
        font-weight: bold;
        -webkit-text-fill-color: #FFFFFF !important; /* Força cor no Safari/iOS */
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
        margin-top: 15px;
    }
    
    div[data-testid="stFormSubmitButton"] button:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 10px 20px rgba(0, 255, 65, 0.4) !important;
    }

    /* Títulos e Textos Gerais */
    h1, h2, h3, h4, h5, h6, p, span {
        color: #FFFFFF !important;
    }

    /* RESPONSIVIDADE PARA CELULARES */
    @media (max-width: 768px) {
        .main-title {
            font-size: 2rem !important;
        }
        .sub-title {
            font-size: 1rem !important;
        }
        .pix-key {
            font-size: 1.1rem !important;
            padding: 10px !important;
        }
        .pix-box {
            padding: 15px !important;
        }
        [data-testid="stForm"] {
            padding: 10px !important;
        }
    }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 2. MOTOR DE DADOS (CSV)
# ==========================================
ARQUIVO_DB = "banco_bolao.csv"

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
    df = pd.concat([df, novo_palpite], ignore_index=True) if not df.empty else novo_palpite
    df.to_csv(ARQUIVO_DB, index=False)

# ==========================================
# 3. INTERFACE VISUAL (FRONT-END)
# ==========================================

# Header
st.markdown("""
<div class="title-box">
    <h1 class="main-title">🏆 BOLÃO DO HEXA</h1>
    <p class="sub-title">BRASIL x ESCÓCIA (FASE DE GRUPOS)</p>
</div>
""", unsafe_allow_html=True)

# Bloco 1: Formulário de Palpite
st.markdown("<h3 style='text-align: center; color: #FFF; font-family: Poppins;'>📝 1. Registre seu Palpite</h3>", unsafe_allow_html=True)

with st.form("form_palpite"):
    col1, col2 = st.columns(2)
    with col1:
        nome_apostador = st.text_input("👤 Seu Nome Completo", placeholder="Ex: João da Silva")
    with col2:
        pix_premio = st.text_input("🔑 Sua Chave Pix (Para receber o prêmio)", placeholder="CPF, Celular, E-mail...")
        
    st.markdown("<br><div style='text-align: center;'><h3 style='font-family: Poppins; color: #FFF;'>⚽ QUAL SERÁ O PLACAR?</h3></div>", unsafe_allow_html=True)
    
    col_br, col_x, col_adv = st.columns([2, 1, 2])
    with col_br:
        gols_brasil = st.number_input("🇧🇷 BRASIL", min_value=0, max_value=20, value=0, step=1)
    with col_x:
        st.markdown("<h1 style='text-align: center; margin-top: 15px; color: #8B9BB4 !important;'>X</h1>", unsafe_allow_html=True)
    with col_adv:
        gols_adversario = st.number_input("🏴󠁧󠁢󠁳󠁣󠁴󠁿 ESCÓCIA", min_value=0, max_value=20, value=0, step=1)
        
    st.markdown("<br>", unsafe_allow_html=True)
    submit_button = st.form_submit_button("✅ CONFIRMAR MEU PALPITE")

    if submit_button:
        if not nome_apostador or not pix_premio:
            st.error("⚠️ Preencha seu nome e a sua chave Pix para receber o prêmio!")
        else:
            salvar_palpite(nome_apostador, pix_premio, gols_brasil, gols_adversario)
            st.success(f"🎉 Palpite registrado com sucesso! Faça o pagamento abaixo para validá-lo, {nome_apostador}!")
            st.balloons()

# Bloco 2: Instruções de Pagamento
st.markdown("<h3 style='text-align: center; color: #FFF; font-family: Poppins; margin-top: 30px;'>💰 2. Valide sua Aposta</h3>", unsafe_allow_html=True)

st.markdown("""
<div class="pix-box">
    <h3 style="color: #FFF !important; font-family: Poppins; margin-bottom: 10px;">Valor Único: R$ 10,00</h3>
    <p style="color: #E2E8F0 !important;">Para que seu palpite seja validado no bolão, faça o Pix para a chave abaixo:</p>
    <div class="pix-key">sua-chave-pix-aleatoria-ou-cpf-aqui</div>
    <p style="font-size: 0.85rem; color: #8B9BB4 !important; margin-top: 10px;">O prêmio total será dividido entre os acertadores do placar exato!</p>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

# Bloco 3: Dashboard de Palpites ao Vivo
st.subheader("📊 Palpites Registrados")

df_palpites = carregar_palpites()

if not df_palpites.empty:
    df_exibicao = df_palpites[["Nome", "Gols_Brasil", "Gols_Adversario"]].copy()
    
    # Adiciona uma coluna visual de Placar (Atualizado para Escócia)
    df_exibicao["Placar Apostado"] = df_exibicao.apply(lambda row: f"🇧🇷 {row['Gols_Brasil']} x {row['Gols_Adversario']} 🏴󠁧󠁢󠁳󠁣󠁴󠁿", axis=1)
    
    st.dataframe(df_exibicao[["Nome", "Placar Apostado"]], use_container_width=True, hide_index=True)
    
    # Mostra o pote total arrecadado
    valor_pote = len(df_palpites) * 10
    st.info(f"🏆 **Pote Total Atual:** R$ {valor_pote},00 ({len(df_palpites)} apostas)")
else:
    st.info("Nenhum palpite registrado ainda. Seja o primeiro a apostar!")