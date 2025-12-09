import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Building2, 
  PieChart, Map, Loader2, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RePieChart, Pie 
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Estados de Dados Reais
  const [stats, setStats] = useState({
    totalDeputados: 0,
    totalPartidos: 0,
    maiorBancada: { sigla: '', qtd: 0 },
    partidosData: [],
    estadosData: [],
    regioesData: []
  });

  // Mapeamento de Regiões
  const regioesMap = {
    'Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
    'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
    'Sul': ['PR', 'RS', 'SC']
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca todos os deputados da legislatura atual
        const response = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000&ordem=ASC&ordenarPor=nome');
        const json = await response.json();
        const deputados = json.dados;

        // 1. Processar por Partido
        const porPartido = deputados.reduce((acc, curr) => {
          acc[curr.siglaPartido] = (acc[curr.siglaPartido] || 0) + 1;
          return acc;
        }, {});

        const partidosArray = Object.entries(porPartido)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value); // Decrescente

        // 2. Processar por Estado
        const porEstado = deputados.reduce((acc, curr) => {
          acc[curr.siglaUf] = (acc[curr.siglaUf] || 0) + 1;
          return acc;
        }, {});

        const estadosArray = Object.entries(porEstado)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // 3. Processar por Região
        const porRegiao = deputados.reduce((acc, curr) => {
          const uf = curr.siglaUf;
          let regiaoEncontrada = 'Outro';
          for (const [regiao, estados] of Object.entries(regioesMap)) {
            if (estados.includes(uf)) {
              regiaoEncontrada = regiao;
              break;
            }
          }
          acc[regiaoEncontrada] = (acc[regiaoEncontrada] || 0) + 1;
          return acc;
        }, {});

        const regioesArray = Object.entries(porRegiao)
          .map(([name, value]) => ({ name, value }));

        setStats({
          totalDeputados: deputados.length,
          totalPartidos: partidosArray.length,
          maiorBancada: { sigla: partidosArray[0].name, qtd: partidosArray[0].value },
          partidosData: partidosArray,
          estadosData: estadosArray,
          regioesData: regioesArray
        });

      } catch (err) {
        console.error("Erro analytics:", err);
        setError(true);
        toast({
          title: "Erro de Carregamento",
          description: "Não foi possível buscar dados da Câmara.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics - FISCALIZA</title>
        <meta name="description" content="Análises em tempo real da composição da Câmara dos Deputados." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Analytics Parlamentares
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Visão geral da distribuição de poder e representatividade na Câmara dos Deputados (Dados Oficiais).
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Parlamentares Ativos</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalDeputados}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Partidos Representados</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalPartidos}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <Building2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Maior Bancada</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.maiorBancada.sigla}</h3>
                  <p className="text-xs text-gray-400">{stats.maiorBancada.qtd} deputados</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Atualização</p>
                  <h3 className="text-lg font-bold text-gray-900">Tempo Real</h3>
                  <p className="text-xs text-green-600 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div> Online</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Gráfico de Partidos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Partido (Top 10)</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.partidosData.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={60} tick={{fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {stats.partidosData.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#93c5fd'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gráfico de Regiões (Pie) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle className="text-lg">Bancadas por Região</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={stats.regioesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.regioesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Gráfico de Estados (Full Width) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="h-[450px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Map className="w-5 h-5 mr-2"/> Representatividade por Estado</CardTitle>
              </CardHeader>
              <CardContent className="h-[370px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.estadosData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]}>
                        {stats.estadosData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.value > 40 ? '#16a34a' : '#86efac'} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;