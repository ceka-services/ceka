document.getElementById('projectForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const major = document.getElementById('major').value;
  const level = document.getElementById('level').value;
  const type = document.getElementById('type').value;
  const domain = document.getElementById('domain').value;

  if (!major || !level || !type || !domain) {
    alert('يرجى ملء جميع الحقول!');
    return;
  }

  const majors = {
    cs: "هندسة حاسوب أو علوم حاسوب",
    is: "نظم معلومات",
    ai: "ذكاء اصطناعي أو تعلّم آلي",
    ce: "هندسة شبكات أو أمن سيبراني"
  };
  const levels = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
  const types = { web: "ويب", mobile: "هاتف", desktop: "سطح مكتب", iot: "أنظمة ذكية" };
  const domains = {
    education: "التعليم",
    health: "الصحة",
    ecommerce: "التجارة الإلكترونية",
    security: "الأمن",
    social: "المجتمع"
  };

  const prompt = `أنا طالب في ${majors[major]}، مستواي ${levels[level]}، وأريد مشروعًا من نوع ${types[type]} في مجال ${domains[domain]}. 
  أعطني بالضبط 3 أفكار مبتكرة لمشروع تخرّج. لكل فكرة:
  - عنوان جذاب
  - وصف قصير (سطر أو سطرين)
  - تقنيات مقترحة للتنفيذ
  لا تكتب مقدمات أو خواتيم. ابدأ مباشرةً بالأفكار مرقمة كالتالي:
  1. ...
  2. ...
  3. ...`;

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="loading">جاري توليد 3 أفكار بواسطة CEKA... 🤖</div>`;

  try {
    const response = await fetch('https://ceka-ai.ceka-services-1.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `الخادم أعاد خطأ: ${response.status}`);
    }

    if (data.choices && data.choices[0]) {
      let content = data.choices[0].message.content;

      const ideaBlocks = [];
      const lines = content.split('\n').map(l => l.trim()).filter(l => l);

      let currentIdea = '';
      for (const line of lines) {
        if (/^\d+\.\s/.test(line)) {
          if (currentIdea) ideaBlocks.push(currentIdea.trim());
          currentIdea = line.replace(/^\d+\.\s*/, '');
        } else if (currentIdea) {
          currentIdea += '\n' + line;
        }
      }
      if (currentIdea) ideaBlocks.push(currentIdea.trim());

      const ideas = ideaBlocks.slice(0, 3);
      while (ideas.length < 3) {
        ideas.push("لم يتم توليد فكرة كافية. يُرجى المحاولة مرة أخرى.");
      }

      let html = `<h2 class="fade-in">✨ 3 أفكار مبتكرة لتخرّجك:</h2>`;

      // ألوان البطاقات (كما في الصورة)
      const colors = [
        { bg: '#2ecc71', text: 'white', title: 'فكرة 1' },
        { bg: '#e67e22', text: 'white', title: 'فكرة 2' },
        { bg: '#1abc9c', text: 'white', title: 'فكرة 3' }
      ];

      ideas.forEach((idea, index) => {
        const parts = idea.split('\n').filter(p => p.trim());
        const title = parts[0] || `فكرة ${index + 1}`;
        const description = parts[1] || 'وصف غير متوفر';
        const tech = parts[2] || 'تقنيات غير محددة';

        const techList = tech.split(',').map(t => t.trim()).join('</li><li>');
        const techHTML = `<ul><li>${techList}</li></ul>`;

        html += `
          <div class="pricing-card fade-in" style="animation-delay: ${index * 0.1}s;">
            <div class="card-header" style="background: ${colors[index].bg}; color: ${colors[index].text};">
              <span class="card-title">${colors[index].title}</span>
              <span class="card-price">فكرة</span>
            </div>
            <div class="card-body">
              <h4>${title}</h4>
              <p><strong>الوصف:</strong> ${description}</p>
              <p><strong>التقنيات:</strong></p>
              ${techHTML}
            </div>
            <div class="card-footer">
              <a href="https://wa.me/9647838451505" target="_blank" class="purchase-btn" style="background: ${colors[index].bg};">📩 اطلب التنفيذ الآن</a>
            </div>
          </div>
        `;
      });

      html += `<div style="clear: both;"></div>`;

      resultsDiv.innerHTML = html;
    } else {
      throw new Error('لم يتم توليد أي فكرة');
    }
  } catch (err) {
    console.error('خطأ:', err);
    resultsDiv.innerHTML = `<p style="color:red; text-align:center; padding:20px; border-radius:10px; background:#ffebeb; margin-top:20px;">❌ خطأ: ${err.message || 'فشل الاتصال بالذكاء الاصطناعي'}</p>`;
  }
});