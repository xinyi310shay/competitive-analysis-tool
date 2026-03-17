const express = require('express');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/analyze', async (req, res) => {
  let { urls, productType, dimensions } = req.body;
  
  if (typeof urls === 'string') {
    urls = urls.split('\n').map(url => url.trim()).filter(url => url.length > 0);
  }
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one URL' });
  }

  try {
    const results = await Promise.all(
      urls.map(async (url, index) => {
        try {
          const fullUrl = !url.startsWith('http') ? `https://${url}` : url;
          const result = await analyzeUrl(fullUrl, index, productType, dimensions);
          return result;
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
          return {
            url,
            error: error.message
          };
        }
      })
    );

    const comprehensiveAnalysis = generateComprehensiveAnalysis(results, productType, dimensions);
    res.render('results', { results, comprehensiveAnalysis, productType, dimensions });
  } catch (error) {
    console.error('Error in analyze route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function analyzeUrl(url, index, productType, dimensions) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 30000
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const basicAnalysis = {
    title: $('title').text(),
    metaDescription: $('meta[name="description"]').attr('content') || '',
    headings: {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length
    },
    images: $('img').length,
    links: $('a').length,
    forms: $('form').length,
    sections: $('section').length,
    divs: $('div').length,
    colors: []
  };
  
  const dimensionScores = generateDimensionScores(basicAnalysis, $, dimensions, productType);
  const swotTags = generateSWOTTags(dimensionScores, basicAnalysis);
  const coreInsight = generateCoreInsight(dimensionScores, basicAnalysis, productType);
  
  return {
    url,
    screenshot: null,
    analysis: basicAnalysis,
    dimensionScores,
    swotTags,
    coreInsight
  };
}

function generateDimensionScores(basicAnalysis, $, dimensions, productType) {
  const scores = {};
  
  if (dimensions.includes('visual')) {
    scores.visual = calculateVisualScore(basicAnalysis, $);
  }
  if (dimensions.includes('information')) {
    scores.information = calculateInformationScore(basicAnalysis, $);
  }
  if (dimensions.includes('interaction')) {
    scores.interaction = calculateInteractionScore(basicAnalysis, $);
  }
  if (dimensions.includes('usability')) {
    scores.usability = calculateUsabilityScore(basicAnalysis, $);
  }
  if (dimensions.includes('brand')) {
    scores.brand = calculateBrandScore(basicAnalysis, $);
  }
  if (dimensions.includes('content')) {
    scores.content = calculateContentScore(basicAnalysis, $);
  }
  
  return scores;
}

function calculateVisualScore(analysis, $) {
  let score = 5;
  if (analysis.images >= 5 && analysis.images <= 30) score += 2;
  if (analysis.headings.h1 === 1) score += 1;
  if (analysis.divs > 100) score += 2;
  return Math.min(10, score);
}

function calculateInformationScore(analysis, $) {
  let score = 5;
  if (analysis.headings.h1 === 1) score += 2;
  if (analysis.headings.h2 >= 3) score += 1;
  if (analysis.sections >= 3) score += 1;
  if (analysis.links >= 10 && analysis.links <= 100) score += 1;
  return Math.min(10, score);
}

function calculateInteractionScore(analysis, $) {
  let score = 5;
  if (analysis.forms >= 1) score += 1;
  const buttons = $('button, [type="button"], [type="submit"]').length;
  if (buttons >= 3) score += 2;
  if (analysis.links >= 20) score += 2;
  return Math.min(10, score);
}

function calculateUsabilityScore(analysis, $) {
  let score = 5;
  if (analysis.headings.h1 === 1) score += 2;
  if (analysis.metaDescription && analysis.metaDescription.length > 0) score += 1;
  const navElements = $('nav, header, [role="navigation"]').length;
  if (navElements >= 1) score += 2;
  return Math.min(10, score);
}

function calculateBrandScore(analysis, $) {
  let score = 5;
  const logoElements = $('img[alt*="logo" i], [class*="logo" i], [id*="logo" i]').length;
  if (logoElements >= 1) score += 2;
  if (analysis.title && analysis.title.length > 0) score += 1;
  if (analysis.images >= 5) score += 2;
  return Math.min(10, score);
}

function calculateContentScore(analysis, $) {
  let score = 5;
  if (analysis.headings.h2 >= 5) score += 2;
  if (analysis.images >= 10) score += 1;
  const paragraphs = $('p').length;
  if (paragraphs >= 10) score += 2;
  return Math.min(10, score);
}

function generateSWOTTags(scores, analysis) {
  const strengths = [];
  const weaknesses = [];
  
  const dimensionNames = {
    visual: '视觉风格',
    information: '信息架构',
    interaction: '交互设计',
    usability: '可用性',
    brand: '品牌表达',
    content: '内容策略'
  };
  
  for (const [dim, score] of Object.entries(scores)) {
    if (score >= 8) {
      strengths.push(`${dimensionNames[dim]}优秀`);
    } else if (score <= 5) {
      weaknesses.push(`${dimensionNames[dim]}待提升`);
    }
  }
  
  if (analysis.headings.h1 === 1) {
    strengths.push('标题层级清晰');
  } else if (analysis.headings.h1 > 1) {
    weaknesses.push('H1标签过多');
  }
  
  return { strengths, weaknesses };
}

function generateCoreInsight(scores, analysis, productType) {
  const maxScore = Math.max(...Object.values(scores));
  const minScore = Math.min(...Object.values(scores));
  
  const dimensionNames = {
    visual: '视觉风格',
    information: '信息架构',
    interaction: '交互设计',
    usability: '可用性',
    brand: '品牌表达',
    content: '内容策略'
  };
  
  let bestDim = '', worstDim = '';
  for (const [dim, score] of Object.entries(scores)) {
    if (score === maxScore) bestDim = dimensionNames[dim];
    if (score === minScore) worstDim = dimensionNames[dim];
  }
  
  const insights = [
    `该产品在${bestDim}方面表现突出，建议重点借鉴其设计理念。`,
    `${worstDim}是该产品的主要短板，可作为我们的差异化突破点。`,
    `整体设计均衡，${bestDim}是核心竞争力，需关注${worstDim}的提升。`,
    `该产品的${bestDim}值得深入研究，可作为我们设计的重要参考。`
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
}

function generateComprehensiveAnalysis(results, productType, dimensions) {
  const validResults = results.filter(r => !r.error);
  if (validResults.length === 0) return null;
  
  const dimensionNames = {
    visual: '视觉风格',
    information: '信息架构',
    interaction: '交互设计',
    usability: '可用性',
    brand: '品牌表达',
    content: '内容策略'
  };
  
  const comparisonTable = {};
  dimensions.forEach(dim => {
    comparisonTable[dim] = {
      name: dimensionNames[dim],
      scores: validResults.map(r => r.dimensionScores[dim] || 0),
      avg: validResults.reduce((sum, r) => sum + (r.dimensionScores[dim] || 0), 0) / validResults.length
    };
  });
  
  const opportunities = generateOpportunities(comparisonTable, productType);
  
  return {
    comparisonTable,
    opportunities,
    overallSummary: generateOverallSummary(comparisonTable, productType)
  };
}

function generateOpportunities(comparisonTable, productType) {
  const opportunities = [];
  
  for (const [dim, data] of Object.entries(comparisonTable)) {
    if (data.avg < 6) {
      opportunities.push({
        dimension: data.name,
        type: 'gap',
        description: `${data.name}是竞品普遍较弱的维度，建议重点突破，建立差异化优势。`
      });
    } else if (data.avg >= 8) {
      opportunities.push({
        dimension: data.name,
        type: 'benchmark',
        description: `${data.name}是竞品的共同优势，需达到行业基准水平，避免落后。`
      });
    }
  }
  
  const productTypeOpportunities = {
    ecommerce: ['优化购物车流程', '强化商品展示', '简化结账体验'],
    saas: ['优化仪表盘设计', '强化数据可视化', '简化操作流程'],
    social: ['优化用户互动', '强化内容展示', '提升社交体验'],
    content: ['优化内容排版', '强化阅读体验', '提升内容发现'],
    tool: ['优化核心功能', '强化操作效率', '简化学习曲线'],
    mobile: ['优化触控设计', '强化单手操作', '简化导航结构'],
    other: ['关注用户体验', '强化核心价值', '提升产品易用性']
  };
  
  const typeOps = productTypeOpportunities[productType] || productTypeOpportunities.other;
  typeOps.forEach(op => {
    opportunities.push({
      dimension: '产品特性',
      type: 'product',
      description: op
    });
  });
  
  return opportunities;
}

function generateOverallSummary(comparisonTable, productType) {
  const highestDim = Object.entries(comparisonTable).sort((a, b) => b[1].avg - a[1].avg)[0];
  const lowestDim = Object.entries(comparisonTable).sort((a, b) => a[1].avg - b[1].avg)[0];
  
  return `在该${productType}产品领域，${highestDim[1].name}是竞品的共同优势，而${lowestDim[1].name}则是普遍的短板。建议重点关注${lowestDim[1].name}的创新突破，同时确保${highestDim[1].name}达到行业基准。`;
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
