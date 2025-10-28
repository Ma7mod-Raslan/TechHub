// src/features/public/pages/HomePage.tsx

import React from 'react';
// 1. استيراد المكونات الفرعية
import Navbar from '../../components/common/Navbar';
import HeroSection from './components/HeroSection.js';
import StatsSection from './components/StatsSection.js';
import MissionSection from './components/MissionSection.js';
import CoursesSection from './components/CoursesSection.js';
import ReadyToStartSection from './components/ReadyToStartSection.js'; 
// المكونات الأخرى التي ظهرت في الصور
import WhoWeAreSection from './components/WhoWeAreSection.js';
import PartnersSection from './components/PartnersSection.js';
//import Header from '../../components/ui/Header.jsx';

// لا نحتاج لـFooter هنا إذا كان موجودًا في الـPublicLayout

const HomePage: React.FC = () => {
  return (
    <div className="HomePage">
      {/* ========================================
        1. شاشات الهبوط الرئيسية (كما في الصور)
        ========================================
      */}
      <Navbar/>
      
      <HeroSection />          
      
      {/* 2. قسم الإحصائيات (10K+ Students) */}
      <StatsSection />         
      
      {/* 3. قسم مهمتنا (Our Mission) */}
      <MissionSection />       

      {/* 4. قسم الكورسات (Explore Top Courses) */}
      <CoursesSection />       

      {/* 5. قسم من نحن (Who We Are) - ممكن يكون جزء من صفحة Who We Are لكنه ظاهر في الهوم بيج */}
      <WhoWeAreSection /> 
      
      {/* 6. قسم شركائنا (Our Partners) - ممكن يكون جزء من صفحة Partners لكنه ظاهر في الهوم بيج */}
      <PartnersSection /> 
      
      {/* 7. القسم التحفيزي النهائي (Ready to Start Learning?) */}
      <ReadyToStartSection />
      
      {/* ⚠️ ملاحظة أخيرة: يجب التأكد من وضع Footer في الـPublicLayout
      */}
    </div>
  );
};

export default HomePage;