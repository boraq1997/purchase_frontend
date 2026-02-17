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

    <!-- Warning Alert Lines -->
    <div class="warning-lines">
      <div v-for="i in 5" :key="i" class="warning-line" :style="{ animationDelay: `${i * 0.3}s` }"></div>
    </div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="error-container">
        <!-- Server Error Icon with Pulse -->
        <div class="server-icon-wrapper">
          <div class="server-icon-bg"></div>
          <div class="server-icon-pulse pulse-1"></div>
          <div class="server-icon-pulse pulse-2"></div>
          <div class="server-icon-pulse pulse-3"></div>
          <i class="pi pi-server server-icon"></i>
          <div class="icon-crack crack-1"></div>
          <div class="icon-crack crack-2"></div>
        </div>

        <!-- Glitch Effect 500 -->
        <div class="error-number-wrapper">
          <div class="error-number" data-text="500">
            <span class="digit">5</span>

            <span class="digit">0</span>
          </div>
          <div class="error-number glitch" data-text="500" aria-hidden="true">500</div>
        </div>

        <!-- Status Badge -->
        <div class="status-badge">
          <span class="status-dot"></span>
          <span class="status-text">خطأ 500 - خطأ في الخادم</span>
        </div>

        <!-- Main Title -->
        <h1 class="error-title">
          <span class="title-line">عذراً!</span>
          <span class="title-line highlight">حدث خطأ في الخادم</span>
        </h1>

        <!-- Description -->
        <p class="error-description">
          نواجه حالياً مشكلة تقنية في الخادم. فريقنا يعمل بجد لحل المشكلة. نعتذر عن الإزعاج ونقدر صبرك
        </p>

        <!-- Server Status Panel -->
        <div class="server-status-panel">
          <div class="panel-header">
            <i class="pi pi-chart-line"></i>
            <span>حالة الخادم</span>
          </div>
          <div class="status-items">
            <div class="status-row">
              <div class="status-label">
                <i class="pi pi-database"></i>
                <span>قاعدة البيانات</span>
              </div>
              <div class="status-indicator error">
                <span class="indicator-dot"></span>
                <span>غير متصل</span>
              </div>
            </div>
            <div class="status-row">
              <div class="status-label">
                <i class="pi pi-server"></i>
                <span>الخادم الرئيسي</span>
              </div>
              <div class="status-indicator warning">
                <span class="indicator-dot"></span>
                <span>قيد الإصلاح</span>
              </div>
            </div>
            <div class="status-row">
              <div class="status-label">
                <i class="pi pi-cloud"></i>
                <span>الخدمات السحابية</span>
              </div>
              <div class="status-indicator success">
                <span class="indicator-dot"></span>
                <span>يعمل بشكل طبيعي</span>
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <i class="pi pi-info-circle"></i>
            <span>آخر تحديث: {{ currentTime }}</span>
          </div>
        </div>

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
            label="إعادة المحاولة"
            icon="pi pi-refresh"
            class="primary-btn"
            @click="retryPage"
            :loading="loading"
          >
            <template #icon>
              <i class="pi pi-refresh btn-icon"></i>
            </template>
          </Button>
          
          <Button 
            label="العودة للرئيسية"
            icon="pi pi-home"
            class="secondary-btn"
            @click="goHome"
          >
            <template #icon>
              <i class="pi pi-home btn-icon"></i>
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
            <i class="pi pi-bolt"></i>
            <span>استجابة: {{ responseTime }}ms</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <i class="pi pi-code"></i>
            <span>ERR_500</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Toast position="top-center" class="custom-toast" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

const router = useRouter();
const toast = useToast();
const loading = ref(false);
const pageRef = ref(null);
const currentTime = ref('');
const responseTime = ref(0);
const hoveredCard = ref(null);

const actionCards = ref([
  {
    icon: 'pi pi-refresh',
    title: 'إعادة تحميل الصفحة',
    description: 'جرب تحديث الصفحة مرة أخرى',
    action: 'reload'
  },
  {
    icon: 'pi pi-home',
    title: 'الصفحة الرئيسية',
    description: 'عد إلى الصفحة الرئيسية',
    action: 'home'
  },
  {
    icon: 'pi pi-question-circle',
    title: 'مركز المساعدة',
    description: 'تحقق من الأسئلة الشائعة',
    action: 'help'
  },
  {
    icon: 'pi pi-envelope',
    title: 'الإبلاغ عن المشكلة',
    description: 'أخبرنا بالمشكلة التي واجهتها',
    action: 'report'
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

const updateResponseTime = () => {
  // Simulate response time
  responseTime.value = Math.floor(Math.random() * 2000) + 500;
};

const handleCardClick = (action) => {
  const actions = {
    reload: retryPage,
    home: goHome,
    help: showHelp,
    report: reportIssue
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

const retryPage = () => {
  loading.value = true;
  toast.add({
    severity: 'info',
    summary: 'جاري إعادة المحاولة',
    detail: 'يتم الآن إعادة تحميل الصفحة...',
    life: 2000
  });
  
  setTimeout(() => {
    window.location.reload();
    loading.value = false;
  }, 2000);
};

const goHome = () => {
  toast.add({
    severity: 'success',
    summary: 'جاري التحويل',
    detail: 'سننقلك إلى الصفحة الرئيسية',
    life: 2000
  });
  
  setTimeout(() => {
    router.push('/');
  }, 2000);
};

const showHelp = () => {
  toast.add({
    severity: 'info',
    summary: 'مركز المساعدة',
    detail: 'جاري فتح مركز المساعدة...',
    life: 2000
  });
  // router.push('/help');
};

const reportIssue = () => {
  toast.add({
    severity: 'info',
    summary: 'الإبلاغ عن مشكلة',
    detail: 'جاري فتح نموذج الإبلاغ...',
    life: 2000
  });
  // router.push('/report');
};

let timeInterval;
let responseInterval;

onMounted(() => {
  updateTime();
  updateResponseTime();
  timeInterval = setInterval(updateTime, 1000);
  responseInterval = setInterval(updateResponseTime, 3000);
  
  // Mouse move parallax effect
  if (pageRef.value) {
    pageRef.value.addEventListener('mousemove', handleMouseMove);
  }
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
  if (responseInterval) clearInterval(responseInterval);
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
  background: #0f0a0a;
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
  background: linear-gradient(90deg, transparent, #ff3366, transparent);
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

/* Gradient Orbs - Red/Orange Theme */
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
  background: radial-gradient(circle, #ff3366 0%, transparent 70%);
  top: -10%;
  right: -10%;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ffaa00 0%, transparent 70%);
  bottom: -10%;
  left: -10%;
  animation: float 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #ff6b35 0%, transparent 70%);
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

/* Warning Lines */
.warning-lines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.warning-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff3366, transparent);
  opacity: 0;
  animation: warningLineSweep 5s ease-in-out infinite;
}

@keyframes warningLineSweep {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    top: 110%;
    opacity: 0;
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
  background: #ff3366;
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

/* Server Icon Wrapper */
.server-icon-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInDown 0.8s ease-out;
}

.server-icon-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 51, 102, 0.2), transparent);
  border-radius: 50%;
  animation: bgPulse 3s ease-in-out infinite;
}

@keyframes bgPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.server-icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid #ff3366;
  border-radius: 50%;
  animation: pulsate 2s ease-out infinite;
}

.pulse-1 {
  animation-delay: 0s;
}

.pulse-2 {
  animation-delay: 0.7s;
}

.pulse-3 {
  animation-delay: 1.4s;
}

@keyframes pulsate {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.server-icon {
  font-size: 4rem;
  color: #ff3366;
  z-index: 2;
  filter: drop-shadow(0 0 20px #ff3366);
  animation: iconShake 4s ease-in-out infinite;
}

@keyframes iconShake {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: rotate(-2deg);
  }
  20%, 40%, 60%, 80% {
    transform: rotate(2deg);
  }
}

.icon-crack {
  position: absolute;
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #ff3366, transparent);
  opacity: 0.6;
}

.crack-1 {
  top: 20%;
  left: 40%;
  transform: rotate(-15deg);
  animation: crackGlow 2s ease-in-out infinite;
}

.crack-2 {
  top: 30%;
  right: 35%;
  transform: rotate(25deg);
  animation: crackGlow 2s ease-in-out infinite 1s;
}

@keyframes crackGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 10px #ff3366;
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
  background: linear-gradient(45deg, #ff3366, #ffaa00, #ff6b35);
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
  opacity: 0.2;
  font-size: 700px;
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
  color: #ff3366;
  z-index: 2;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px #ff3366);
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px #ff3366);
  }
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 51, 102, 0.1);
  border: 1px solid rgba(255, 51, 102, 0.3);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #ff3366;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 10px #ff3366;
  }
  50% {
    opacity: 0.5;
    box-shadow: 0 0 20px #ff3366;
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
  background: linear-gradient(90deg, #ff3366, #ffaa00);
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
  max-width: 700px;
  margin: 0 auto 3rem;
  font-weight: 300;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

/* Server Status Panel */
.server-status-panel {
  max-width: 600px;
  margin: 0 auto 3rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 51, 102, 0.3);
  border-radius: 15px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.8s ease-out 0.7s both;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 51, 102, 0.1);
  border-bottom: 1px solid rgba(255, 51, 102, 0.2);
  color: #ff3366;
  font-weight: 600;
  font-size: 1rem;
}

.panel-header i {
  font-size: 1.2rem;
}

.status-items {
  padding: 1.5rem;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

.status-label i {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-indicator.error {
  background: rgba(255, 51, 102, 0.15);
  color: #ff3366;
  border: 1px solid rgba(255, 51, 102, 0.3);
}

.status-indicator.warning {
  background: rgba(255, 170, 0, 0.15);
  color: #ffaa00;
  border: 1px solid rgba(255, 170, 0, 0.3);
}

.status-indicator.success {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: indicatorPulse 2s ease-in-out infinite;
}

@keyframes indicatorPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
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
  border-color: rgba(255, 51, 102, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 51, 102, 0.1) 0%, transparent 70%);
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
  background: linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(255, 170, 0, 0.1));
  border-radius: 15px;
  border: 1px solid rgba(255, 51, 102, 0.2);
  transition: all 0.4s ease;
}

.action-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 30px rgba(255, 51, 102, 0.3);
}

.card-icon {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #ff3366, #ffaa00);
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
  background: rgba(255, 51, 102, 0.1);
  color: #ff3366;
  transition: all 0.3s ease;
}

.action-card:hover .card-arrow {
  transform: translateX(-5px);
  background: rgba(255, 51, 102, 0.2);
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
  background: linear-gradient(135deg, #ff3366, #ffaa00);
  border: none;
  box-shadow: 0 10px 30px rgba(255, 51, 102, 0.3);
}

.primary-btn:deep(.p-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 51, 102, 0.4);
}

.secondary-btn:deep(.p-button) {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.secondary-btn:deep(.p-button:hover) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 51, 102, 0.5);
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
  color: #ff3366;
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Toast */
.custom-toast :deep(.p-toast-message) {
  background: rgba(15, 10, 10, 0.95);
  border: 1px solid rgba(255, 51, 102, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.custom-toast :deep(.p-toast-message-content) {
  color: #ffffff;
}

.custom-toast :deep(.p-toast-icon) {
  color: #ff3366;
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
  
  .server-status-panel {
    margin-left: 1rem;
    margin-right: 1rem;
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
  
  .server-icon-wrapper {
    width: 120px;
    height: 120px;
  }
  
  .server-icon {
    font-size: 3rem;
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