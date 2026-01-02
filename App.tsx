import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Hammer, 
  HardHat, 
  Ruler, 
  BrickWall, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ProjectCardProps {
  image: string;
  title: string;
  category: string;
}

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  image: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
    <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ image, title, category }) => (
  <div className="group relative overflow-hidden rounded-xl cursor-pointer">
    <img 
      src={image} 
      alt={title} 
      className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
      <span className="text-orange-400 font-medium text-sm mb-1 uppercase tracking-wider">{category}</span>
      <h3 className="text-white text-2xl font-bold">{title}</h3>
    </div>
  </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, content, image }) => (
  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
    <div className="flex gap-1 text-orange-500 mb-4">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
    </div>
    <p className="text-slate-700 mb-6 italic">"{content}"</p>
    <div className="flex items-center gap-4">
      <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <h4 className="font-bold text-slate-900">{name}</h4>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </div>
  </div>
);

// --- AI Chat Component ---

const AIConsultant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Привет! Я виртуальный помощник СтройМастер. Хотите узнать примерную стоимость ремонта или получить совет по материалам?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [{ text: `System Instruction: Ты опытный консультант строительной компании "СтройМастер". Отвечай кратко, профессионально и дружелюбно. Твоя цель - помочь клиенту с первичными вопросами по строительству, ремонту и материалам. Не давай точных смет, только приблизительные оценки. В конце ответа предлагай связаться с менеджером для детального расчета.
            
            User Question: ${userMessage}` }]
          }
        ]
      });

      const text = response.text || "Извините, я сейчас не могу ответить. Пожалуйста, попробуйте позже.";
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Произошла ошибка при соединении с сервером. Пожалуйста, позвоните нам." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-900 p-4 flex items-center gap-3">
        <div className="bg-orange-500 p-2 rounded-full">
          <MessageSquare className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold">AI Консультант</h3>
          <p className="text-slate-400 text-xs">Онлайн 24/7</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-orange-500 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
              <Loader2 className="animate-spin text-orange-500" size={16} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Задайте вопрос о строительстве..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 text-white p-2 rounded-lg">
                <HardHat size={24} />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Строй<span className="text-orange-600">Мастер</span></span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-slate-600 hover:text-orange-600 font-medium transition-colors">Услуги</a>
              <a href="#projects" className="text-slate-600 hover:text-orange-600 font-medium transition-colors">Проекты</a>
              <a href="#about" className="text-slate-600 hover:text-orange-600 font-medium transition-colors">О нас</a>
              <a href="#contact" className="text-slate-600 hover:text-orange-600 font-medium transition-colors">Контакты</a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs text-slate-500">Есть вопросы?</span>
                <span className="font-bold text-slate-900">+7 (999) 123-45-67</span>
              </div>
              <a href="#contact" className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20">
                Заказать звонок
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 top-20 shadow-xl py-4 px-6 flex flex-col gap-4">
            <a href="#services" className="text-lg font-medium text-slate-800" onClick={() => setIsMenuOpen(false)}>Услуги</a>
            <a href="#projects" className="text-lg font-medium text-slate-800" onClick={() => setIsMenuOpen(false)}>Проекты</a>
            <a href="#about" className="text-lg font-medium text-slate-800" onClick={() => setIsMenuOpen(false)}>О нас</a>
            <a href="#contact" className="text-lg font-medium text-slate-800" onClick={() => setIsMenuOpen(false)}>Контакты</a>
            <hr className="border-slate-100" />
            <a href="#contact" className="bg-orange-600 text-white text-center py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>
              Заказать расчет
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
            alt="Construction Site" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide uppercase">Лидеры рынка 2024</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Мы строим не просто здания, мы создаем <span className="text-orange-500">будущее</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Полный цикл строительных работ: от проектирования до финишной отделки. Качество, проверенное временем и сотнями довольных клиентов.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2">
                Рассчитать стоимость <ArrowRight size={20} />
              </a>
              <a href="#projects" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm flex items-center justify-center">
                Смотреть проекты
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-orange-600 py-12 relative z-20 -mt-8 mx-4 md:mx-12 rounded-2xl shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-orange-500/30">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">15+</div>
              <div className="text-orange-100 text-sm md:text-base">Лет опыта</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">350+</div>
              <div className="text-orange-100 text-sm md:text-base">Проектов</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-orange-100 text-sm md:text-base">Гарантия</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-orange-100 text-sm md:text-base">Специалистов</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Наши Услуги</h2>
            <p className="text-slate-600 text-lg">
              Мы предлагаем комплексные решения для задач любого масштаба, от частных домов до промышленных объектов.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Hammer size={28} />}
              title="Строительство домов"
              description="Возведение загородных домов, коттеджей и таунхаусов под ключ из кирпича, газобетона или дерева."
            />
            <ServiceCard 
              icon={<Ruler size={28} />}
              title="Проектирование"
              description="Разработка индивидуальных архитектурных проектов, дизайн-проектов интерьеров и ландшафта."
            />
            <ServiceCard 
              icon={<BrickWall size={28} />}
              title="Капитальный ремонт"
              description="Комплексный ремонт жилых и коммерческих помещений. От демонтажа до чистовой отделки."
            />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Реализованные Проекты</h2>
              <p className="text-slate-600 text-lg">
                Взгляните на наши последние работы. Мы гордимся каждым построенным объектом.
              </p>
            </div>
            <a href="#" className="text-orange-600 font-bold hover:text-orange-700 inline-flex items-center gap-2">
              Все проекты <ArrowRight size={20} />
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard 
              image="https://images.unsplash.com/photo-1600596542815-2a4d9fdd40d6?q=80&w=2070&auto=format&fit=crop"
              title="Вилла в Сосновом Бору"
              category="Жилая недвижимость"
            />
            <ProjectCard 
              image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
              title="ЖК 'Панорама'"
              category="Коммерческая застройка"
            />
            <ProjectCard 
              image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"
              title="Лофт-офис IT Park"
              category="Интерьеры"
            />
          </div>
        </div>
      </section>

      {/* Features/About Section */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-100 rounded-full z-0" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-100 rounded-full z-0" />
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop" 
                alt="Engineers working" 
                className="relative z-10 rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Почему выбирают <span className="text-orange-600">СтройМастер</span>?
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Мы понимаем, что строительство — это инвестиция в будущее. Наш подход основан на прозрачности, соблюдении сроков и бескомпромиссном качестве материалов.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Фиксированная смета</h4>
                    <p className="text-slate-500">Цена не меняется в процессе работ. Все прописано в договоре.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Соблюдение сроков</h4>
                    <p className="text-slate-500">Мы ценим ваше время и сдаем объекты точно в срок, без задержек.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Гарантия 5 лет</h4>
                    <p className="text-slate-500">Мы уверены в качестве наших работ и даем расширенную гарантию.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Отзывы Клиентов</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Алексей Петров"
              role="Владелец загородного дома"
              content="Спасибо команде СтройМастер за дом мечты! Все сделали быстро, аккуратно и в рамках бюджета. Особенно порадовал профессионализм прораба."
              image="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <TestimonialCard 
              name="Елена Смирнова"
              role="Директор ресторана"
              content="Заказывали ремонт помещения под ресторан. Сложный дизайн-проект был реализован на 100%. Очень довольны сотрудничеством!"
              image="https://randomuser.me/api/portraits/women/44.jpg"
            />
            <TestimonialCard 
              name="Дмитрий Волков"
              role="Инвестор"
              content="Сотрудничаем уже 3 года по нескольким объектам. Надежный партнер, который никогда не подводит со сроками. Рекомендую."
              image="https://randomuser.me/api/portraits/men/67.jpg"
            />
          </div>
        </div>
      </section>

      {/* Contact & AI Section */}
      <section id="contact" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Contact Form & Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Свяжитесь с нами</h2>
              <p className="text-slate-600 mb-8">
                Оставьте заявку на бесплатную консультацию и расчет сметы. Наш менеджер свяжется с вами в течение 15 минут.
              </p>
              
              <div className="flex flex-col gap-6 mb-10">
                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-orange-600">
                    <Phone size={20} />
                  </div>
                  <span className="font-medium text-lg">+7 (999) 123-45-67</span>
                </div>
                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-orange-600">
                    <Mail size={20} />
                  </div>
                  <span className="font-medium text-lg">info@stroymaster.ru</span>
                </div>
                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-orange-600">
                    <MapPin size={20} />
                  </div>
                  <span className="font-medium text-lg">г. Москва, ул. Строителей, д. 10, офис 404</span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Ваше имя" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
                  <input type="tel" placeholder="Телефон" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
                </div>
                <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" />
                <textarea placeholder="Опишите ваш проект..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"></textarea>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-colors">
                  Отправить заявку
                </button>
              </form>
            </div>

            {/* AI Assistant Widget */}
            <div className="flex flex-col justify-center">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full mb-2">
                  AI POWERED
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Мгновенная консультация</h3>
                <p className="text-slate-500">
                  Не хотите ждать? Задайте вопрос нашему ИИ-эксперту прямо сейчас. Он поможет с выбором материалов и предварительной оценкой.
                </p>
              </div>
              <AIConsultant />
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-600 text-white p-2 rounded-lg">
                  <HardHat size={20} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Строй<span className="text-orange-500">Мастер</span></span>
              </div>
              <p className="max-w-sm">
                Мы создаем качественное жилье и коммерческие объекты с 2010 года. Доверяйте профессионалам.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Навигация</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="hover:text-orange-500 transition-colors">Услуги</a></li>
                <li><a href="#projects" className="hover:text-orange-500 transition-colors">Проекты</a></li>
                <li><a href="#about" className="hover:text-orange-500 transition-colors">О компании</a></li>
                <li><a href="#contact" className="hover:text-orange-500 transition-colors">Контакты</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Соцсети</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">VKontakte</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} СтройМастер. Все права защищены.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white transition-colors">Договор оферты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;