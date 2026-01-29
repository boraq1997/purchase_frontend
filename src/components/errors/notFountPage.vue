<template>
  <div class="error-page" ref="pageRef">
    <!-- Animated Grid Background -->
    <div class="grid-background">
      <div class="grid-lines">
        <div v-for="i in 20" :key="`v-${i}`" class="grid-line vertical" :style="{ left: `${i * 5}%` }"></div>
        <div v-for="i in 20" :key="`h-${i}`" class="grid-line horizontal" :style="{ top: `${i * 5}%` }"></div>
      </div>
      <div class="gradient-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <div v-for="i in 30" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="error-container">
        <!-- Glitch Effect 404 -->
        <div class="error-number-wrapper">
          <div class="error-number" data-text="404">
            <span class="digit">4</span>
            <span class="digit middle">
              <div class="zero-container">
                <svg class="rotating-circle" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#00f5ff;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#fc00ff;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="url(#circleGradient)" stroke-width="3" stroke-dasharray="502" stroke-dashoffset="0">
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="0 100 100"
                      to="360 100 100"
                      dur="8s"
                      repeatCount="indefinite"/>
                  </circle>
                  <circle cx="100" cy="100" r="60" fill="none" stroke="url(#circleGradient)" stroke-width="2" opacity="0.5">
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="360 100 100"
                      to="0 100 100"
                      dur="6s"
                      repeatCount="indefinite"/>
                  </circle>
                </svg>
                <i class="pi pi-compass zero-icon"></i>
              </div>
            </span>
            <span class="digit">4</span>
          </div>
          <div class="error-number glitch" data-text="404" aria-hidden="true">404</div>
        </div>

        <!-- Status Badge -->
        <div class="status-badge">
          <span class="status-dot"></span>
          <span class="status-text">خطأ 404 - الصفحة غير موجودة</span>
        </div>

        <!-- Main Title -->
        <h1 class="error-title">
          <span class="title-line">يبدو أنك</span>
          <span class="title-line highlight">ضللت الطريق</span>
        </h1>

        <!-- Description -->
        <p class="error-description">
          الصفحة التي تبحث عنها قد انتقلت إلى عالم رقمي آخر، أو ربما لم تكن موجودة أبداً في هذا الكون
        </p>

        <!-- Interactive Cards -->
        <div class="cards-grid">
          <div 
            v-for="(card, index) in actionCards" 
            :key="index"
            class="action-card"
            @click="handleCardClick(card.action)"
            @mouseenter="handleCardHover(index)"
            @mouseleave="handleCardLeave"
          >
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-icon-wrapper">
                <i :class="card.icon" class="card-icon"></i>
              </div>
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
              <div class="card-arrow">
                <i class="pi pi-arrow-left"></i>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="cta-section">
          <Button 
            label="العودة للرئيسية"
            icon="pi pi-home"
            class="primary-btn"
            @click="goHome"
            :loading="loading"
          >
            <template #icon>
              <i class="pi pi-home btn-icon"></i>
            </template>
          </Button>
          
          <Button 
            label="الصفحة السابقة"
            icon="pi pi-arrow-right"
            class="secondary-btn"
            @click="goBack"
          >
            <template #icon>
              <i class="pi pi-arrow-right btn-icon"></i>
            </template>
          </Button>
        </div>

        <!-- Footer Info -->
        <div class="footer-info">
          <div class="info-item">
            <i class="pi pi-clock"></i>
            <span>{{ currentTime }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <i class="pi pi-map-marker"></i>
            <span>موقع غير محدد</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <i class="pi pi-code"></i>
            <span>ERR_404</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from "primevue/usetoast";
import Button from 'primevue/button';

const router = useRouter();
const toast = useToast(); // Toast notifications
const loading = ref(false);
const pageRef = ref(null);
const currentTime = ref('');
const hoveredCard = ref(null);

const actionCards = ref([
  {
    icon: 'pi pi-home',
    title: 'الصفحة الرئيسية',
    description: 'عد إلى نقطة البداية واستكشف من جديد',
    action: 'home'
  },
  {
    icon: 'pi pi-search',
    title: 'البحث المتقدم',
    description: 'ابحث عن أي شيء تريده في موقعنا',
    action: 'search'
  },
  {
    icon: 'pi pi-book',
    title: 'دليل الموقع',
    description: 'تصفح جميع الأقسام والصفحات المتاحة',
    action: 'sitemap'
  },
  {
    icon: 'pi pi-headphones',
    title: 'الدعم الفني',
    description: 'تواصل معنا للحصول على المساعدة',
    action: 'support'
  }
]);

const getParticleStyle = (index) => {
  const delay = (index * 0.1);
  const duration = 15 + (index % 10);
  const size = 2 + (index % 4);
  return {
    left: `${(index * 3.33) % 100}%`,
    top: `${(index * 7) % 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('ar-EG', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

const handleCardClick = (action) => {
  const actions = {
    home: goHome,
    search: showSearch,
    sitemap: showSitemap,
    support: contactSupport
  };
  
  if (actions[action]) {
    actions[action]();
  }
};

const handleCardHover = (index) => {
  hoveredCard.value = index;
};

const handleCardLeave = () => {
  hoveredCard.value = null;
};

const goHome = () => {
  loading.value = true;
  toast.add({
    severity: 'success',
    summary: 'جاري التحويل',
    detail: 'سننقلك إلى الصفحة الرئيسية',
    life: 2000
  });
  
  setTimeout(() => {
    router.push('/');
    loading.value = false;
  }, 2000);
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    toast.add({
      severity: 'info',
      summary: 'تنبيه',
      detail: 'لا توجد صفحة سابقة للعودة إليها',
      life: 3000
    });
  }
};

const showSearch = () => {
  toast.add({
    severity: 'info',
    summary: 'البحث',
    detail: 'جاري فتح صفحة البحث...',
    life: 2000
  });
  // router.push('/search');
};

const showSitemap = () => {
  toast.add({
    severity: 'info',
    summary: 'دليل الموقع',
    detail: 'جاري تحميل خريطة الموقع...',
    life: 2000
  });
  // router.push('/sitemap');
};

const contactSupport = () => {
  toast.add({
    severity: 'info',
    summary: 'الدعم الفني',
    detail: 'جاري فتح صفحة الدعم...',
    life: 2000
  });
  // router.push('/support');
};

let timeInterval;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  
  // Mouse move parallax effect
  if (pageRef.value) {
    pageRef.value.addEventListener('mousemove', handleMouseMove);
  }
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  if (pageRef.value) {
    pageRef.value.removeEventListener('mousemove', handleMouseMove);
  }
});

const handleMouseMove = (e) => {
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;
  
  const xPercent = (clientX / innerWidth - 0.5) * 20;
  const yPercent = (clientY / innerHeight - 0.5) * 20;
  
  const orbs = document.querySelectorAll('.orb');
  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 0.5;
    orb.style.transform = `translate(${xPercent * speed}px, ${yPercent * speed}px)`;
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.error-page {
  position: relative;
  min-height: 100vh;
  background: #0a0a0f;
  font-family: 'Tajawal', sans-serif;
  color: #ffffff;
  overflow: hidden;
  direction: rtl;
}

/* Grid Background */
.grid-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.03;
}

.grid-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
}

.grid-line.vertical {
  width: 1px;
  height: 100%;
  animation: gridPulseVertical 4s ease-in-out infinite;
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
  animation: gridPulseHorizontal 4s ease-in-out infinite;
}

@keyframes gridPulseVertical {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.1; }
}

@keyframes gridPulseHorizontal {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.08; }
}

/* Gradient Orbs */
.gradient-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
  filter: blur(100px);
}

.orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  transition: transform 0.3s ease-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #00f5ff 0%, transparent 70%);
  top: -10%;
  right: -10%;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #fc00ff 0%, transparent 70%);
  bottom: -10%;
  left: -10%;
  animation: float 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #00ff88 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 30s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(50px, -50px);
  }
  66% {
    transform: translate(-50px, 50px);
  }
}

/* Particles */
.particles {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: #00f5ff;
  border-radius: 50%;
  opacity: 0.3;
  animation: particleFloat 20s infinite linear;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 3;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

/* Error Number with Glitch */
.error-number-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.error-number {
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 900;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: transparent;
  background: linear-gradient(45deg, #00f5ff, #fc00ff, #00ff88);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: gradientShift 5s ease infinite;
  position: relative;
  z-index: 2;
}

.error-number .digit {
  display: inline-block;
  animation: digitBounce 3s ease-in-out infinite;
}

.error-number .digit:nth-child(1) {
  animation-delay: 0s;
}

.error-number .digit:nth-child(3) {
  animation-delay: 0.2s;
}

.error-number .digit.middle {
  position: relative;
}

@keyframes digitBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.error-number.glitch {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    opacity: 0.8;
    opacity: 0.2;
    font-size: 700px;
}

@keyframes glitch {
  /* 0% {
    clip-path: inset(40% 0 61% 0);
    transform: translateX(-50%) translateY(0);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translateX(calc(-50% + 5px)) translateY(5px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translateX(calc(-50% - 5px)) translateY(-5px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translateX(calc(-50% + 3px)) translateY(3px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translateX(calc(-50% - 3px)) translateY(-3px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translateX(-50%) translateY(0);
  } */
}

/* Zero Container with SVG */
.zero-container {
  position: relative;
  width: clamp(80px, 12vw, 120px);
  height: clamp(80px, 12vw, 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotating-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.zero-icon {
  font-size: clamp(2rem, 5vw, 3rem);
  color: #00f5ff;
  z-index: 2;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px #00f5ff);
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px #00f5ff);
  }
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #fc00ff;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 10px #fc00ff;
  }
  50% {
    opacity: 0.5;
    box-shadow: 0 0 20px #fc00ff;
  }
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

/* Title */
.error-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.title-line {
  display: block;
  color: rgba(255, 255, 255, 0.9);
}

.title-line.highlight {
  background: linear-gradient(90deg, #00f5ff, #fc00ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  position: relative;
}

/* Description */
.error-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto 3rem;
  font-weight: 300;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.action-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.action-card:hover {
  transform: translateY(-8px);
  border-color: rgba(0, 245, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.action-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 2;
}

.card-icon-wrapper {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(252, 0, 255, 0.1));
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  transition: all 0.4s ease;
}

.action-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.3);
}

.card-icon {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #00f5ff, #fc00ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.card-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
  margin-bottom: 1rem;
}

.card-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: rgba(0, 245, 255, 0.1);
  color: #00f5ff;
  transition: all 0.3s ease;
}

.action-card:hover .card-arrow {
  transform: translateX(-5px);
  background: rgba(0, 245, 255, 0.2);
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.action-card:hover .card-shine {
  left: 100%;
}

/* CTA Section */
.cta-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease-out 1s both;
}

.cta-section :deep(.p-button) {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-family: 'Tajawal', sans-serif;
  min-width: 180px;
}

.primary-btn:deep(.p-button) {
  background: linear-gradient(135deg, #00f5ff, #fc00ff);
  border: none;
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.3);
}

.primary-btn:deep(.p-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 245, 255, 0.4);
}

.secondary-btn:deep(.p-button) {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.secondary-btn:deep(.p-button:hover) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 245, 255, 0.5);
  transform: translateY(-3px);
}

.btn-icon {
  margin-left: 0.5rem;
}

/* Footer Info */
.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.8s ease-out 1.2s both;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.info-item i {
  color: #00f5ff;
  font-size: 1rem;
}

.info-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Toast */
.custom-toast :deep(.p-toast-message) {
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.custom-toast :deep(.p-toast-message-content) {
  color: #ffffff;
}

.custom-toast :deep(.p-toast-icon) {
  color: #00f5ff;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .cta-section {
    flex-direction: column;
  }

  .cta-section :deep(.p-button) {
    width: 100%;
  }

  .footer-info {
    flex-direction: column;
    gap: 1rem;
  }

  .info-divider {
    width: 100%;
    height: 1px;
  }

  .error-number {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .status-badge {
    font-size: 0.75rem;
    padding: 0.4rem 1rem;
  }

  .action-card {
    padding: 1.5rem;
  }

  .card-icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .card-icon {
    font-size: 1.5rem;
  }
}

/* Performance Optimizations */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>