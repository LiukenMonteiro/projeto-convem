'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Tipos para as transações
interface Transaction {
  id: string;
  value: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  type: 'cashin' | 'cashout';
  createdAt: string;
  processedAt?: string;
}

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'cashin' | 'cashout'>('all');

  // Função para buscar transações
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Buscando transações de:', `${API_URL}/transactions`);
      
      const response = await axios.get(`${API_URL}/transactions`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Resposta da API:', response.data);
      setTransactions(response.data.transactions || []);
    } catch (err: unknown) {
      console.error('Erro ao buscar transações:', err);
      
      let errorMessage = 'Falha ao carregar transações.';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Não foi possível conectar ao backend. Verifique se ele está rodando na porta 8080.';
        } else if (err.response) {
          errorMessage = `Erro ${err.response.status}: ${err.response.data?.error || err.response.statusText}`;
        } else if (err.request) {
          errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Carregar transações ao montar o componente
  useEffect(() => {
    fetchTransactions();
    
    // Recarregar a cada 30 segundos
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'FAILED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'cashin' 
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
      : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  const totalCashIn = transactions.filter(t => t.type === 'cashin').length;
  const totalCashOut = transactions.filter(t => t.type === 'cashout').length;
  const confirmedTransactions = transactions.filter(t => t.status === 'CONFIRMED').length;

  // Filtrar transações baseado na aba ativa
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    return transaction.type === activeTab;
  });

  const getTabCount = (type: 'all' | 'cashin' | 'cashout') => {
    if (type === 'all') return transactions.length;
    return transactions.filter(t => t.type === type).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23000' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            🏦 Convem Pix Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Sistema de pagamentos PIX integrado com Asaas e AWS
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">API: {API_URL}</span>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total de Transações</p>
                <p className="text-3xl font-bold text-white">{transactions.length}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Depósitos (Cash In)</p>
                <p className="text-3xl font-bold text-blue-400">{totalCashIn}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Saques (Cash Out)</p>
                <p className="text-3xl font-bold text-purple-400">{totalCashOut}</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Confirmadas</p>
                <p className="text-3xl font-bold text-green-400">{confirmedTransactions}</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">Erro na conexão:</p>
                <p>{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchTransactions}
              className="mt-3 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 text-red-200 rounded-lg text-sm transition-all duration-200"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Card de transações com abas */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {/* Cabeçalho do card com abas */}
          <div className="bg-gray-800/70 border-b border-gray-700 px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Transações</span>
              </h2>
              
              {/* Sistema de Abas */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'all'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Todas</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {getTabCount('all')}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('cashin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'cashin'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <span>💰 Depósitos</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {getTabCount('cashin')}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('cashout')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === 'cashout'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span>💸 Saques</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {getTabCount('cashout')}
                  </span>
                </button>
              </div>

              <button
                onClick={fetchTransactions}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                } flex items-center space-x-2`}
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
            </div>
          </div>

          {/* Conteúdo do card com scroll */}
          <div className="p-6">
            {loading && transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4"></div>
                <p className="text-gray-400">Carregando transações...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400 text-lg mb-2">
                  {activeTab === 'all' 
                    ? 'Nenhuma transação encontrada'
                    : activeTab === 'cashin'
                    ? 'Nenhum depósito encontrado'
                    : 'Nenhum saque encontrado'
                  }
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {activeTab === 'all' 
                    ? 'Use os scripts de teste para gerar transações de exemplo'
                    : activeTab === 'cashin'
                    ? 'Execute: node generate-qrcodes.js para criar depósitos'
                    : 'Execute: node generate-cashouts.js para criar saques'
                  }
                </p>
                {activeTab === 'all' && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-gray-400 mb-3">Para gerar dados de teste:</p>
                    <div className="bg-gray-900/50 rounded-lg p-3 font-mono text-xs text-gray-300">
                      <div>cd scripts</div>
                      <div>node generate-qrcodes.js</div>
                      <div>node generate-cashouts.js</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-700">
                {/* Indicador da aba ativa */}
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {activeTab === 'all' && `Mostrando todas as ${filteredTransactions.length} transações`}
                      {activeTab === 'cashin' && `Mostrando ${filteredTransactions.length} depósitos`}
                      {activeTab === 'cashout' && `Mostrando ${filteredTransactions.length} saques`}
                    </p>
                    {activeTab !== 'all' && (
                      <button
                        onClick={() => setActiveTab('all')}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Ver todas →
                      </button>
                    )}
                  </div>
                </div>

                {/* Container com scroll fixo */}
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800/70 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                        {activeTab === 'all' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Criação</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Processamento</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                      {filteredTransactions.map((transaction, index) => (
                        <tr key={transaction.id} className={`hover:bg-gray-700/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/10'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded border border-gray-600">
                              {transaction.id.substring(0, 8)}...
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-white font-bold text-sm">
                              {formatCurrency(transaction.value)}
                            </span>
                          </td>
                          {activeTab === 'all' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(transaction.type)}`}>
                                {transaction.type === 'cashin' ? (
                                  <><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                  </svg>Depósito</>
                                ) : (
                                  <><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>Saque</>
                                )}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                              {transaction.status === 'CONFIRMED' && (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {transaction.status === 'PENDING' && (
                                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                              {transaction.status === 'FAILED' && (
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {transaction.processedAt ? formatDate(transaction.processedAt) : (
                              <span className="text-gray-500 italic">Aguardando...</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💳 Sistema Pix Convem - Integração com Asaas e AWS</p>
          <p className="mt-1">Node.js + TypeScript + Next.js + DynamoDB + SQS + Lambda</p>
        </div>
      </div>
    </div>
  );
}