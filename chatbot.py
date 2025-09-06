# chatbot_module.py
import streamlit as st
from langgraph.graph import StateGraph, END, add_messages
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver
import os
import yfinance as yf
import ccxt

# ---------------- Setup ----------------
load_dotenv()
conn = sqlite3.connect("chatbot.sqlite3", check_same_thread=False)
memory = SqliteSaver(conn)

llm = ChatGoogleGenerativeAI(
    model="models/gemini-1.5-flash",
    temperature=0.1
)

class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# -------- Helpers --------
def get_stock_price(symbol: str):
    try:
        stock = yf.Ticker(symbol)
        price = stock.history(period="1d")["Close"].iloc[-1]
        return f"📈 The current price of {symbol.upper()} is ${price:.2f}"
    except Exception:
        return f"⚠️ Could not fetch stock price for {symbol}"

def get_crypto_price(symbol: str):
    try:
        exchange = ccxt.binance()
        ticker = exchange.fetch_ticker(f"{symbol}/USDT")
        price = ticker["last"]
        return f"💰 The current price of {symbol.upper()} is ${price:.2f}"
    except Exception:
        return f"⚠️ Could not fetch crypto price for {symbol}"

# -------- Node --------
def chat_node(state: ChatState):
    messages = state["messages"]
    user_msg = messages[-1].content.lower()

    if "stock price" in user_msg:
        if "apple" in user_msg:
            response = get_stock_price("AAPL")
        elif "tesla" in user_msg:
            response = get_stock_price("TSLA")
        else:
            response = "⚠️ Please specify a valid stock symbol (e.g., Apple, Tesla)."
        return {"messages": messages + [HumanMessage(content=response)]}

    elif "bitcoin" in user_msg or "btc" in user_msg:
        response = get_crypto_price("BTC")
        return {"messages": messages + [HumanMessage(content=response)]}

    elif "ethereum" in user_msg or "eth" in user_msg:
        response = get_crypto_price("ETH")
        return {"messages": messages + [HumanMessage(content=response)]}

    response = llm.invoke(messages)
    return {"messages": messages + [response]}

# -------- Build Graph --------
graph = StateGraph(ChatState)
graph.add_node("chatnode", chat_node)
graph.set_entry_point("chatnode")
graph.add_edge("chatnode", END)
chatbot = graph.compile(checkpointer=memory)

# -------- UI Function --------
def chatbot_ui():
    st.header("💬 AI Chatbot")

    st.sidebar.title("⚖️ Chat History")
    thread_id = st.sidebar.text_input("Session ID", value="session_1")
    config = {"configurable": {"thread_id": thread_id}}

    if st.sidebar.button("🗑️ Delete History"):
        try:
            memory.delete_thread(config)
            conn.commit()
            st.sidebar.success(f"History for '{thread_id}' deleted.")
            st.rerun()
        except Exception as e:
            st.sidebar.error(f"Error: {e}")

    try:
        state = chatbot.get_state(config)
        history = state.values.get("messages", [])
    except Exception:
        history = []

    for msg in history:
        if isinstance(msg, HumanMessage):
            with st.chat_message("user"):
                st.markdown(msg.content)
        else:
            with st.chat_message("assistant"):
                st.markdown(msg.content)

    user_input = st.chat_input("Type your message...")

    if user_input:
        with st.chat_message("user"):
            st.markdown(user_input)

        initial_state = {"messages": [HumanMessage(content=user_input)]}
        response = chatbot.invoke(initial_state, config=config)
        bot_reply = response["messages"][-1].content

        with st.chat_message("assistant"):
            st.markdown(bot_reply)
