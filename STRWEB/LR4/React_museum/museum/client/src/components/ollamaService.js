
const OLLAMA_API_URL = 'http://localhost:11434/api';

export const checkOllamaStatus = async () => {
  try {
        
    const response = await fetch(`${OLLAMA_API_URL}/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000 
    });
    
    if (!response.ok) {
      console.warn('⚠️ Ollama не отвечает, статус:', response.status);
      return {
        available: false,
        models: [],
        message: 'Ollama не запущен или недоступен',
        error: `HTTP ${response.status}`
      };
    }
    
    const data = await response.json();;
    
    return {
      available: true,
      models: data.models || [],
      message: `Доступно моделей: ${data.models?.length || 0}`,
      details: data.models
    };
  } catch (error) {
    console.warn('❌ Ошибка подключения к Ollama:', error.message);
        
    return {
      available: false,
      models: [],
      message: 'Ollama не доступен. Установите с https://ollama.ai/',
      error: error.message
    };
  }
};

export const analyzeWithOllama = async (exhibit, analysisType = 'description') => {
  const startTime = Date.now();
  const status = await checkOllamaStatus();
  
  if (!status.available) {
    console.log('⚠️ Используется демо-режим (Ollama не доступен)');
    return getDemoResponse(exhibit, analysisType);
  }
  
  const hasMistral = status.models.some(model => model.name.includes('mistral'));
  const modelToUse = hasMistral ? 'mistral' : (status.models[0]?.name || 'mistral');
  
  
  const prompt = generatePrompt(exhibit, analysisType);
  
  try {
      
    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: modelToUse,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7, 
          top_p: 0.9,      
          top_k: 40,     
          num_predict: 100, 
          repeat_penalty: 1.1, 
          seed: 42       
        },
        system: getSystemPrompt(analysisType)
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка Ollama API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`✅ AI анализ завершен за ${processingTime}мс`);
    
    return {
      success: true,
      content: formatResponse(data.response, analysisType),
      model: data.model,
      time: processingTime,
      tokens: data.total_duration ? Math.round(data.total_duration / 1000000) : 0,
      type: analysisType,
      title: getAnalysisTitle(analysisType),
      note: `Сгенерировано моделью ${data.model} за ${processingTime}мс`,
      raw: data.response,
      status: 'success'
    };
    
  } catch (error) {
    console.error('❌ Ошибка AI анализа:', error);
    const endTime = Date.now();
    
    return {
      success: false,
      content: getFallbackResponse(exhibit, analysisType),
      model: 'error',
      time: endTime - startTime,
      tokens: 0,
      type: analysisType,
      title: getAnalysisTitle(analysisType) + ' (ошибка)',
      note: `Ошибка: ${error.message}. Проверьте, что Ollama запущен.`,
      error: error.message,
      status: 'error'
    };
  }
};

const getSystemPrompt = (analysisType) => {
  const prompts = {
    description: `Ты - профессиональный искусствовед и эксперт музея. Твоя задача - создавать увлекательные, 
информативные и профессиональные описания музейных экспонатов.`,
    conservation: `Ты - эксперт по консервации и реставрации музейных ценностей с 20-летним опытом..`,
    art: `Ты - ведущий искусствовед, специалист по истории искусства.
Проводи комплексный искусствоведческий анализ произведений.`
  };  
  return prompts[analysisType] || prompts.description;
};

const generatePrompt = (exhibit, analysisType) => {
  const { 
    name = 'Неизвестный экспонат', 
    description = 'Описание отсутствует',
    category = 'Неизвестная категория',
    year = 'Неизвестный год',
    materials = [],
    conservationState = 'Неизвестно',
    dimensions = {},
    location = {},
    value = 'Не оценено'
  } = exhibit;
  
  const materialsText = Array.isArray(materials) ? materials.join(', ') : materials;
  const dimensionsText = dimensions ? `Высота: ${dimensions.height || '?'}см, Ширина: ${dimensions.width || '?'}см, Глубина: ${dimensions.depth || '?'}см` : 'Не указаны';
  const locationText = location ? `Зал: ${location.hall || '?'}, Комната: ${location.room || '?'}` : 'Местоположение не указано';
  
  const baseInfo = `
ИНФОРМАЦИЯ ОБ ЭКСПОНАТЕ:
Название: ${name}
Описание: ${description}
`.trim();

  switch (analysisType) {
    case 'description':
      return `${baseInfo}
Создай подробное, увлекательное описание этого музейного экспоната для посетителей.
Длина: примерно 50-100 слов.`;
    case 'conservation':
      return `${baseInfo}
Проведи профессиональный анализ состояния сохранности и дай рекомендации:
1. Оценка текущего состояния (от 1 до 10)
2. Основные риски и угрозы.`;
    case 'art':
      return `${baseInfo}
Проведи искусствоведческий анализ:
1. Символика и смысловое наполнение
2. Влияние на современность.`;
    default:
      return `${baseInfo}
Сделай комплексный анализ этого музейного экспоната.`;
  }
};

const formatResponse = (response, type) => {
  
  let cleaned = response
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n'); 
  
  switch (type) {
    case 'description':
      if (!cleaned.includes('#') && !cleaned.includes('##')) {
        cleaned = `# ${getAnalysisTitle(type)}\n\n${cleaned}`;
      }
      break;
      
    case 'conservation':
      if (!cleaned.includes('##')) {
       cleaned = `# Отчет о состоянии сохранности\n\n${cleaned}`;
      }
      break;
      
    case 'art':
      if (!cleaned.includes('##')) {
        cleaned = `# Искусствоведческий анализ\n\n${cleaned}`;
      }
      break;
  }
  
  return cleaned;
};

const getAnalysisTitle = (type) => {
  const titles = {
    description: '📝 AI-описание экспоната',
    conservation: '🛡️ Анализ состояния сохранности',
    art: '🎨 Искусствоведческий анализ',
    history: '📜 Исторический контекст'
  };
  return titles[type] || '🤖 AI анализ';
};


const getDemoResponse = (exhibit, type) => {
  const { 
    name = 'Экспонат', 
    category = 'неизвестная категория', 
    year = 'неизвестный год',
    materials = [],
    conservationState = 'неизвестно'
  } = exhibit;
  
  const responses = {
    description: `# ${name}

## Историческая справка
Экспонат "${name}" представляет собой уникальный образец ${category}, созданный в ${year} году. Этот предмет является важной частью культурного наследия и демонстрирует высокий уровень мастерства создателей.

## Технические характеристики
- **Материалы:** ${Array.isArray(materials) ? materials.join(', ') : materials}
- **Год создания:** ${year}
- **Категория:** ${category}
- **Состояние:** ${conservationState}

## Культурное значение
Данный экспонат имеет большую историческую ценность и представляет интерес для исследователей и ценителей искусства. Он отражает традиции и технологии своего времени.

## Интересный факт
Подобные предметы часто использовались в церемониальных или бытовых целях, что говорит о их значимости в повседневной жизни людей той эпохи.

*Примечание: Для получения полноценного AI-анализа установите Ollama с https://ollama.ai/*`,

    conservation: `# Отчет о состоянии сохранности

## Экспонат: ${name}
## Категория: ${category}
## Год создания: ${year}

## Оценка состояния: ${conservationState}

### Рекомендации по сохранению:

1. **Условия хранения**
   - Температура: 18-22°C (±2°C)
   - Относительная влажность: 45-55%
   - Освещенность: не более 50 люкс
   - Защита от прямого солнечного света

2. **Режим контроля**
   - Ежедневный визуальный осмотр
   - Еженедельная проверка параметров среды
   - Ежемесячная фотофиксация
   - Ежегодная полная диагностика

3. **Меры предосторожности**
   - Избегать температурных перепадов >5°C/час
   - Использовать бескислотные материалы для упаковки
   - Ограничить физический контакт
   - Хранить в индивидуальном контейнере

4. **План консервации**
   - Неделя 1-2: Документирование текущего состояния
   - Неделя 3-4: Поверхностная очистка
   - Неделя 5-8: Стабилизация (при необходимости)
   - Неделя 9-12: Финальная оценка

*Для точного анализа требуется установка Ollama*`,

    art: `# Искусствоведческий анализ

## Произведение: "${name}"

### Стилистическая атрибуция
Экспонат относится к направлению ${category}, что проявляется в характерных особенностях формы и декора.

### Композиционный анализ
- **Баланс:** Гармоничное соотношение элементов
- **Ритм:** Повторяющиеся мотивы создают единство
- **Акценты:** Центральные элементы привлекают внимание

### Колористическое решение
Использование цветовой палитры, характерной для исторического периода создания. Тона подобраны с учетом символического значения.

### Техника исполнения
${materials.length > 0 ? `Применены традиционные материалы: ${Array.isArray(materials) ? materials.join(', ') : materials}` : 'Традиционная техника исполнения'}

### Историко-культурный контекст
Создан в ${year} году, что соответствует периоду ${getHistoricalPeriod(year)}. Отражает художественные тенденции и социальные условия своего времени.

### Значение в истории искусства
Представляет интерес как пример ${category} и вносит вклад в понимание развития художественных традиций.

*Установите Ollama для детального AI-анализа*`
  };
  
  return {
    success: false,
    content: responses[type] || responses.description,
    model: 'demo',
    time: 100,
    tokens: 0,
    type: type,
    title: getAnalysisTitle(type) + ' (демо)',
    note: 'Ollama не установлен.',
    status: 'demo'
  };
};

const getFallbackResponse = (exhibit, type) => {
  const demo = getDemoResponse(exhibit, type);
  return demo.content;
};

const getHistoricalPeriod = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return 'неизвестного периода';
  if (y < -3000) return 'древнейших цивилизаций';
  if (y < 500) return 'античности';
  if (y < 1500) return 'средневековья';
  if (y < 1800) return 'эпохи Возрождения';
  if (y < 1900) return 'Нового времени';
  if (y < 2000) return 'модернизма';
  return 'современного искусства';
};

export const streamOllamaResponse = async (prompt, model = 'mistral', onChunk, onComplete) => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 1000
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка стриминга: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            fullResponse += data.response;
            if (onChunk) {
              onChunk(data.response, fullResponse);
            }
          }
        } catch (e) {
         
        }
      }
    }
    
    if (onComplete) {
      onComplete(fullResponse);
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Ошибка стриминга Ollama:', error);
    throw error;
  }
};

export default {
  checkOllamaStatus,
    analyzeWithOllama,
  streamOllamaResponse  
};