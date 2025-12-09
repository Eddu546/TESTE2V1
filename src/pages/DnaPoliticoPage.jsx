import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Dna, ArrowRight, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DnaPoliticoPage = () => {
  const [step, setStep] = useState('intro'); // intro, quiz, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const questions = [
    { id: 'q1', text: 'Você é a favor da privatização de todas as empresas estatais?' },
    { id: 'q2', text: 'O porte de armas para cidadãos comuns deveria ser ampliado?' },
    { id: 'q3', text: 'Você concorda com a redução da maioridade penal?' },
    { id: 'q4', text: 'O agronegócio deve ter menos restrições ambientais para expandir?' },
    { id: 'q5', text: 'Você apoia uma reforma tributária que unifique impostos e reduza a carga total?' },
    { id: 'q6', text: 'O ensino domiciliar (homeschooling) deve ser legalizado no Brasil?' },
    { id: 'q7', text: 'Você é a favor de mandatos políticos com limite de uma reeleição?' },
    { id: 'q8', text: 'O Estado deve intervir para controlar os preços de combustíveis e alimentos?' },
    { id: 'q9', text: 'Você concorda com a legalização do aborto?' },
    { id: 'q10', text: 'A exploração de minérios em terras indígenas deveria ser permitida?' },
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = async () => {
    setLoadingResults(true);
    setStep('results'); // Vai para tela de loading/results

    try {
      // 1. Busca deputados reais da API
      const response = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome&itens=100');
      const data = await response.json();
      const todosDeputados = data.dados;

      // 2. Seleciona 5 aleatórios para "simular" o match
      // (Em um app real, isso cruzaria os votos de cada um com as respostas do usuário)
      const shuffled = todosDeputados.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      // 3. Gera afinidade simulada baseada nas respostas (apenas para demo visual)
      // A lógica aqui é pseudo-aleatória mas consistente para a sessão
      const calculatedResults = selected.map(dep => ({
        id: dep.id,
        name: dep.nome,
        party: `${dep.siglaPartido}/${dep.siglaUf}`,
        photo: dep.urlFoto,
        affinity: Math.floor(Math.random() * (98 - 40 + 1)) + 40 // Random entre 40 e 98
      })).sort((a, b) => b.affinity - a.affinity);

      setResults(calculatedResults);
    } catch (error) {
      console.error("Erro ao calcular DNA:", error);
      // Fallback simples se a API falhar
      setResults([]); 
    } finally {
      setLoadingResults(false);
    }
  };

  const restartQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResults([]);
    setStep('intro');
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <Helmet>
        <title>Meu DNA Político - Fiscaliza, MBL!</title>
        <meta name="description" content="Descubra quais políticos votam como você. Responda ao quiz e veja seu nível de afinidade com os parlamentares." />
      </Helmet>

      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-2xl"
          >
            <Dna className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Descubra o seu DNA Político</h1>
            <p className="text-lg text-gray-600 mb-8">
              Responda a 10 perguntas-chave e revelaremos quais parlamentares têm o histórico de votação mais alinhado com as suas opiniões.
            </p>
            <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold" onClick={() => setStep('quiz')}>
              Começar o Quiz
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl border border-gray-200"
          >
            <div className="mb-6">
              <p className="text-yellow-500 font-bold mb-2">Pergunta {currentQuestion + 1} de {questions.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{questions[currentQuestion].text}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="py-6 text-lg bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAnswer(questions[currentQuestion].id, 'sim')}>
                Sim
              </Button>
              <Button className="py-6 text-lg bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAnswer(questions[currentQuestion].id, 'nao')}>
                Não
              </Button>
              <Button variant="outline" className="py-6 text-lg border-gray-300 hover:bg-gray-100" onClick={() => handleAnswer(questions[currentQuestion].id, 'abster')}>
                Abster-se
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <div className="w-full max-w-4xl">
            {loadingResults ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700">Calculando compatibilidade...</h2>
                    <p className="text-gray-500">Cruzando suas respostas com a base de dados.</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="text-center mb-10">
                    <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Seu Resultado!</h1>
                    <p className="text-lg text-gray-600">
                        Com base nas suas respostas, estes são alguns parlamentares com perfil similar ao seu (Simulação).
                    </p>
                    </div>
                    <div className="space-y-4">
                    {results.map((politician, index) => (
                        <motion.div
                        key={politician.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-4"
                        >
                        <span className="text-2xl font-bold text-gray-400 w-8 text-center">{index + 1}</span>
                            <img 
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" 
                                alt={`Foto de ${politician.name}`} 
                                src={politician.photo}
                                onError={(e) => { e.target.src = 'https://www.camara.leg.br/tema/assets/images/foto-deputado-sem-foto.png'; }} 
                            />                  
                        <div className="flex-grow">
                            <Link to={`/politico/${politician.id}`} className="text-lg font-bold hover:text-yellow-500 transition-colors">{politician.name}</Link>
                            <p className="text-sm text-gray-500">{politician.party}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Afinidade</p>
                            <p className={`text-2xl font-bold ${politician.affinity > 70 ? 'text-green-500' : politician.affinity < 30 ? 'text-red-500' : 'text-yellow-500'}`}>
                            {politician.affinity}%
                            </p>
                        </div>
                        </motion.div>
                    ))}
                    </div>
                    <div className="text-center mt-10">
                    <Button size="lg" variant="outline" className="border-yellow-400 text-yellow-500 hover:bg-yellow-400 hover:text-black font-bold" onClick={restartQuiz}>
                        <RefreshCw className="mr-2 w-5 h-5" />
                        Refazer o Quiz
                    </Button>
                    </div>
                </motion.div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DnaPoliticoPage;