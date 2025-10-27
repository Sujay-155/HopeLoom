import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { 
  Sprout, Heart, Phone, Mail, MapPin, Check, Brain, Target, 
  Star, Lock, BarChart3, Menu, X, Send, Clock, Users, 
  Shield, AlertCircle, MessageCircle, ChevronRight, ChevronLeft, Instagram 
} from 'lucide-react';
import CardSwap, { Card } from './CardSwap';
import DecryptedText from './DecryptedText';
import AutoDecryptText from './AutoDecryptText';

// ==================== MOCK DATA ====================
// Mock data for professionals - will be reused in Part 2
const PROFESSIONALS_DATA = [
  {
    id: 1,
    name: "Dr. Somesh",
    title: "Counselor",
    specializations: ["Addiction", "Grief and Trauma Therapy", "Pocso Expert"],
    image: "sm.jpg",
    bio: "Experience of working with childrens conflicts with laws"
  },
  {
    id: 2,
    name: "Dr. James Chen",
    title: "Licensed Therapist",
    specializations: ["Stress Management", "Relationships", "Work-Life Balance"],
    image: "https://placehold.co/400x400/247124/ffffff?text=JC",
    bio: "Specializing in mindfulness-based interventions"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    title: "Psychiatric Nurse Practitioner",
    specializations: ["Mood Disorders", "ADHD", "Medication Management"],
    image: "https://placehold.co/400x400/2d8f2d/ffffff?text=ER",
    bio: "Holistic approach to mental health care"
  },
  {
    id: 4,
    name: "Dr. Michael Thompson",
    title: "Licensed Clinical Social Worker",
    specializations: ["Family Therapy", "Grief Counseling", "PTSD"],
    image: "https://placehold.co/400x400/247124/ffffff?text=MT",
    bio: "Compassionate care for individuals and families"
  }
];

// Mock testimonials data
const TESTIMONIALS_DATA = [
  {
    id: 1,
    quote: "HopeLoom helped me find the support I needed during a difficult time. The professionals are caring and understanding.",
    author: "Anonymous",
    rating: 5
  },
  {
    id: 2,
    quote: "The screening tools gave me insight into my mental health. I'm now on a path to feeling better every day.",
    author: "J.K.",
    rating: 5
  },
  {
    id: 3,
    quote: "I was hesitant at first, but the welcoming environment and professional care made all the difference.",
    author: "M.R.",
    rating: 5
  }
];

// Mock blog posts data
const BLOG_POSTS_DATA = [
  {
    id: 1,
    title: "5 Ways to Manage Daily Anxiety",
    snippet: "Discover practical techniques to reduce anxiety and find calm in your everyday life...",
    image: "https://placehold.co/600x400/a6d7a6/222222?text=Anxiety+Tips",
    date: "October 15, 2025",
    category: "Anxiety"
  },
  {
    id: 2,
    title: "Understanding Depression: You're Not Alone",
    snippet: "Learn about depression, its symptoms, and how seeking help is a sign of strength...",
    image: "https://placehold.co/600x400/2d8f2d/ffffff?text=Depression+Guide",
    date: "October 10, 2025",
    category: "Depression"
  },
  {
    id: 3,
    title: "The Power of Mindfulness Meditation",
    snippet: "Explore how mindfulness can transform your mental well-being and daily perspective...",
    image: "https://placehold.co/600x400/a6d7a6/222222?text=Mindfulness",
    date: "October 5, 2025",
    category: "Wellness"
  },
  {
    id: 4,
    title: "Building Healthy Sleep Habits",
    snippet: "Quality sleep is essential for mental health. Discover strategies for better rest...",
    image: "https://placehold.co/600x400/2d8f2d/ffffff?text=Sleep+Health",
    date: "September 28, 2025",
    category: "Self-Care"
  },
  {
    id: 5,
    title: "Navigating Stress at Work",
    snippet: "Practical tips for managing workplace stress and maintaining work-life balance...",
    image: "https://placehold.co/600x400/a6d7a6/222222?text=Work+Stress",
    date: "September 20, 2025",
    category: "Stress"
  },
  {
    id: 6,
    title: "The Importance of Social Connection",
    snippet: "How meaningful relationships contribute to our mental health and overall happiness...",
    image: "https://placehold.co/600x400/2d8f2d/ffffff?text=Connection",
    date: "September 15, 2025",
    category: "Relationships"
  }
];

// ==================== UTILITY HOOKS ====================
// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [elementRef, isVisible];
};

// ==================== HEADER COMPONENT ====================
const Header = ({ currentPage, setCurrentPage, user, userProfile, onLogout, onLoginRequired }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'professionals', label: 'Our Professionals' },
    { id: 'resources', label: 'Resources' },
    { id: 'screening', label: 'Screening Hub' },
    { id: 'book', label: 'Book Appointment' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-2xl font-bold transition-all duration-300 z-50 flex items-center gap-2"
            style={{ color: '#2d8f2d' }}
          >
            <Sprout className="w-7 h-7" />
            <span>HopeLoom</span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`transition-all duration-300 font-medium ${
                  currentPage === link.id
                    ? 'text-[#2d8f2d] border-b-2 border-[#2d8f2d]'
                    : 'text-[#555555] hover:text-[#2d8f2d]'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            {/* Instagram Link */}
            <a
              href="https://www.instagram.com/hopeloomorg?igsh=MWdnYTU3dm1kYWZr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#555555] hover:text-[#E4405F] transition-all duration-300"
              title="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            
            {/* User Info / Logout or Sign In Button */}
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-[#a6d7a6]">
                <span className="text-sm text-[#555555]">
                  {userProfile?.name || user.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-sm text-[#2d8f2d] hover:text-[#247124] font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginRequired}
                className="ml-4 px-6 py-2 bg-[#2d8f2d] hover:bg-[#247124] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-[#2d8f2d] z-50 transition-transform duration-300"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 bg-white border-t-4 border-[#2d8f2d] shadow-lg z-40 transition-all duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100 visible translate-y-0'
              : 'opacity-0 invisible -translate-y-full'
          }`}
          style={{ top: '72px' }} // Adjust based on header height
        >
          <div className="flex flex-col items-center justify-start pt-8 space-y-6 px-4 bg-white h-full">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-xl font-semibold transition-all duration-300 w-full py-3 rounded-lg border-2 ${
                  currentPage === link.id
                    ? 'text-white bg-[#2d8f2d] border-[#2d8f2d]'
                    : 'text-[#222222] border-[#a6d7a6] hover:text-white hover:bg-[#2d8f2d] hover:border-[#2d8f2d]'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            {/* Mobile Instagram Link */}
            <a
              href="https://www.instagram.com/hopeloomorg?igsh=MWdnYTU3dm1kYWZr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg border-2 border-[#a6d7a6] hover:border-[#E4405F] text-[#222222] hover:text-[#E4405F] font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Instagram className="w-5 h-5" />
              <span>Follow us on Instagram</span>
            </a>
            
            {/* Mobile User Info / Logout or Sign In */}
            {user ? (
              <div className="w-full pt-4 border-t-2 border-[#a6d7a6] space-y-3">
                <p className="text-center text-sm text-[#555555]">
                  {userProfile?.name || user.email}
                </p>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="w-full pt-4 border-t-2 border-[#a6d7a6]">
                <button
                  onClick={() => {
                    onLoginRequired();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-[#2d8f2d] hover:bg-[#247124] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ top: '72px' }}
          />
        )}
      </nav>
    </header>
  );
};

// ==================== FOOTER COMPONENT ====================
const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="bg-[#222222] text-[#fefefe] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2d8f2d' }}>
              <Sprout className="w-7 h-7" />
              <span>HopeLoom</span>
            </h3>
            <p className="text-[#fefefe] opacity-80">
              Your partner in mental wellness and hope.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['home', 'about', 'professionals', 'resources'].map((page) => (
                <li key={page}>
                  <button
                    onClick={() => setCurrentPage(page)}
                    className="text-[#fefefe] opacity-80 hover:opacity-100 hover:text-[#a6d7a6] transition-all duration-300 capitalize"
                  >
                    {page === 'professionals' ? 'Our Professionals' : page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentPage('screening')}
                  className="text-[#fefefe] opacity-80 hover:opacity-100 hover:text-[#a6d7a6] transition-all duration-300"
                >
                  Screening Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('book')}
                  className="text-[#fefefe] opacity-80 hover:opacity-100 hover:text-[#a6d7a6] transition-all duration-300"
                >
                  Book Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="text-[#fefefe] opacity-80 hover:opacity-100 hover:text-[#a6d7a6] transition-all duration-300"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-bold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:text-[#a6d7a6] transition-all duration-300">
                📘
              </a>
              <a href="#" className="text-2xl hover:text-[#a6d7a6] transition-all duration-300">
                🐦
              </a>
              <a href="#" className="text-2xl hover:text-[#a6d7a6] transition-all duration-300">
                📷
              </a>
              <a href="#" className="text-2xl hover:text-[#a6d7a6] transition-all duration-300">
                💼
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#555555] mt-8 pt-8 text-center">
          <p className="text-[#fefefe] opacity-70">
            © 2025 HopeLoom. All rights reserved. | Your mental health matters.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ==================== HOME PAGE ====================
const HomePage = ({ setCurrentPage, user, onLoginRequired }) => {
  const [servicesRef, servicesVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();

  return (
    <div className="bg-[#f8fcf8]">
      {/* Hero Section with 3D Motion Trails */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Motion Trails Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated 3D Trail 1 - Full Left to Right */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute w-[800px] h-40 rounded-full opacity-50 blur-3xl"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #a6d7a6 20%, #2d8f2d 50%, #247124 80%, transparent 100%)',
                animation: 'trail1 8s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          {/* Animated 3D Trail 2 - Full Right to Left */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute w-[750px] h-36 rounded-full opacity-45 blur-3xl"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, #2d8f2d 25%, #247124 50%, #a6d7a6 75%, transparent 100%)',
                animation: 'trail2 10s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          {/* Animated 3D Trail 3 - Vertical Top to Bottom */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute w-[700px] h-32 rounded-full opacity-42 blur-2xl"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #a6d7a6 30%, #2d8f2d 60%, transparent 100%)',
                animation: 'trail3 12s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          {/* Animated 3D Trail 4 - Full Left to Right Wave */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute w-[850px] h-44 rounded-full opacity-38 blur-3xl"
              style={{
                background: 'linear-gradient(45deg, transparent 0%, #247124 20%, #2d8f2d 50%, #a6d7a6 80%, transparent 100%)',
                animation: 'trail4 9s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          {/* Animated 3D Trail 5 - Diagonal Full Sweep */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute w-[780px] h-38 rounded-full opacity-48 blur-2xl"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, #2d8f2d 35%, #a6d7a6 65%, transparent 100%)',
                animation: 'trail5 11s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          {/* Animated 3D Trail 6 - Full Right to Left Crossing */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute w-[820px] h-40 rounded-full opacity-44 blur-3xl"
              style={{
                background: 'linear-gradient(270deg, transparent 0%, #a6d7a6 25%, #247124 50%, #2d8f2d 75%, transparent 100%)',
                animation: 'trail6 13s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}
            ></div>
          </div>

          {/* Static Ambient Glow - more visible */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#a6d7a6]/25 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content - Two Column Layout */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#222222] animate-fadeIn">
                Welcome to{' '}
                <AutoDecryptText
                  text="HopeLoom"
                  interval={4000}
                  speed={50}
                  maxIterations={15}
                  sequential={true}
                  revealDirection="start"
                  className="revealed"
                  encryptedClassName="encrypted"
                  parentClassName="inline-block"
                  style={{ color: '#2d8f2d' }}
                />
              </h1>
              <p className="text-xl md:text-2xl text-[#555555] mb-8 max-w-2xl mx-auto lg:mx-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                Your journey to mental wellness starts here. We're here to support you with compassion, 
                expertise, and hope for a brighter tomorrow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                {user ? (
                  <button
                    onClick={() => setCurrentPage('screening')}
                    className="bg-[#2d8f2d] hover:bg-[#247124] text-[#fefefe] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>Take an Assessment</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onLoginRequired}
                      className="bg-[#2d8f2d] hover:bg-[#247124] text-[#fefefe] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <Lock className="w-5 h-5" />
                      <span>Sign In to Get Started</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage('about')}
                      className="bg-white hover:bg-[#f8fcf8] text-[#2d8f2d] border-2 border-[#2d8f2d] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <span>Learn More</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Animated Cards */}
            <div className="hidden lg:block relative h-[600px]">
              <CardSwap
                width={320}
                height={400}
                cardDistance={50}
                verticalDistance={60}
                delay={4000}
                pauseOnHover={true}
                easing="elastic"
              >
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-white">
                    <Brain className="w-16 h-16 mb-4 text-[#a6d7a6]" />
                    <h3 className="text-2xl font-bold mb-3 text-[#2d8f2d]">Mental Health Assessments</h3>
                    <p className="text-[#555555] text-center">
                      Take scientifically-backed assessments for depression, anxiety, stress, and PTSD
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-white">
                    <Users className="w-16 h-16 mb-4 text-[#a6d7a6]" />
                    <h3 className="text-2xl font-bold mb-3 text-[#2d8f2d]">Professional Support</h3>
                    <p className="text-[#555555] text-center">
                      Book appointments with experienced counselors and mental health professionals
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 h-full flex flex-col justify-center items-center text-white">
                    <Heart className="w-16 h-16 mb-4 text-[#a6d7a6]" />
                    <h3 className="text-2xl font-bold mb-3 text-[#2d8f2d]">24/7 Resources</h3>
                    <p className="text-[#555555] text-center">
                      Access self-help guides, coping strategies, and emergency hotlines anytime
                    </p>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-4xl text-[#2d8f2d]">↓</div>
        </div>

        {/* CSS Animations - Injected via style tag */}
        <style>{`
          @keyframes trail1 {
            0% {
              transform: translate(-100%, 10%) scale(1) rotateZ(45deg);
              opacity: 0;
            }
            10% {
              opacity: 0.5;
            }
            50% {
              transform: translate(50%, 30%) scale(1.1) rotateZ(45deg);
              opacity: 0.5;
            }
            90% {
              opacity: 0.5;
            }
            100% {
              transform: translate(120%, 50%) scale(1) rotateZ(45deg);
              opacity: 0;
            }
          }

          @keyframes trail2 {
            0% {
              transform: translate(120%, 70%) scale(1) rotateZ(-45deg);
              opacity: 0;
            }
            15% {
              opacity: 0.45;
            }
            50% {
              transform: translate(50%, 50%) scale(1.05) rotateZ(-45deg);
              opacity: 0.45;
            }
            85% {
              opacity: 0.45;
            }
            100% {
              transform: translate(-100%, 30%) scale(1) rotateZ(-45deg);
              opacity: 0;
            }
          }

          @keyframes trail3 {
            0% {
              transform: translate(-80%, 40%) scale(1) rotateZ(15deg);
              opacity: 0;
            }
            20% {
              opacity: 0.42;
            }
            50% {
              transform: translate(50%, 50%) scale(1.08) rotateZ(15deg);
              opacity: 0.42;
            }
            80% {
              opacity: 0.42;
            }
            100% {
              transform: translate(130%, 60%) scale(1) rotateZ(15deg);
              opacity: 0;
            }
          }

          @keyframes trail4 {
            0% {
              transform: translate(-100%, 25%) scale(1) rotateZ(30deg);
              opacity: 0;
            }
            12% {
              opacity: 0.38;
            }
            50% {
              transform: translate(50%, 45%) scale(1.12) rotateZ(30deg);
              opacity: 0.38;
            }
            88% {
              opacity: 0.38;
            }
            100% {
              transform: translate(130%, 65%) scale(1) rotateZ(30deg);
              opacity: 0;
            }
          }

          @keyframes trail5 {
            0% {
              transform: translate(130%, 15%) scale(1) rotateZ(-30deg);
              opacity: 0;
            }
            18% {
              opacity: 0.48;
            }
            50% {
              transform: translate(50%, 40%) scale(1.06) rotateZ(-30deg);
              opacity: 0.48;
            }
            82% {
              opacity: 0.48;
            }
            100% {
              transform: translate(-100%, 65%) scale(1) rotateZ(-30deg);
              opacity: 0;
            }
          }

          @keyframes trail6 {
            0% {
              transform: translate(140%, 55%) scale(1) rotateZ(-15deg);
              opacity: 0;
            }
            14% {
              opacity: 0.44;
            }
            50% {
              transform: translate(50%, 55%) scale(1.1) rotateZ(-15deg);
              opacity: 0.44;
            }
            86% {
              opacity: 0.44;
            }
            100% {
              transform: translate(-100%, 55%) scale(1) rotateZ(-15deg);
              opacity: 0;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </section>

      {/* Services Section */}
      <section
        ref={servicesRef}
        className={`py-20 transition-all duration-1000 ${
          servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#222222]">
            How We Can <span style={{ color: '#2d8f2d' }}>Help You</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <Brain className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#222222]">Mental Health Screening</h3>
              <p className="text-[#555555] mb-4">
                Take our confidential assessments to gain insights into your mental well-being.
              </p>
              <button
                onClick={() => setCurrentPage('screening')}
                className="text-[#2d8f2d] hover:text-[#247124] font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <span>Learn More</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Service Card 2 */}
            <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <Users className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#222222]">Professional Support</h3>
              <p className="text-[#555555] mb-4">
                Connect with licensed therapists and counselors who truly care about your journey.
              </p>
              <button
                onClick={() => setCurrentPage('professionals')}
                className="text-[#2d8f2d] hover:text-[#247124] font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <span>Meet Our Team</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Service Card 3 */}
            <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <Shield className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#222222]">Wellness Resources</h3>
              <p className="text-[#555555] mb-4">
                Access articles, exercises, and tools to support your mental health every day.
              </p>
              <button
                onClick={() => setCurrentPage('resources')}
                className="text-[#2d8f2d] hover:text-[#247124] font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <span>Explore Resources</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        className={`py-20 bg-white transition-all duration-1000 ${
          testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-[#222222]">
            Stories of <span style={{ color: '#2d8f2d' }}>Hope</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS_DATA.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#f8fcf8] rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300"
              >
                {/* Star Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-2xl text-[#2d8f2d]">★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-[#555555] mb-4 italic">"{testimonial.quote}"</p>
                {/* Author */}
                <p className="text-[#222222] font-semibold">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-[#2d8f2d] to-[#247124]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#fefefe]">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-[#fefefe] opacity-90 mb-8 max-w-2xl mx-auto">
            Take a moment for yourself. Book an appointment with one of our caring professionals today.
          </p>
          <button
            onClick={() => setCurrentPage('book')}
            className="bg-white text-[#2d8f2d] hover:bg-[#f8fcf8] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Book Your Appointment
          </button>
        </div>
      </section>
    </div>
  );
};

// ==================== ABOUT PAGE ====================
const AboutPage = () => {
  const [missionRef, missionVisible] = useScrollAnimation();
  const [visionRef, visionVisible] = useScrollAnimation();

  return (
    <div className="bg-[#f8fcf8] min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#222222]">
            About <span style={{ color: '#2d8f2d' }}>HopeLoom</span>
          </h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            We believe that everyone deserves access to compassionate, professional mental health support.
          </p>
        </div>

        {/* Our Mission Section */}
        <section
          ref={missionRef}
          className={`mb-16 transition-all duration-1000 ${
            missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-white rounded-lg p-12 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-6 text-[#222222]">
                  Our <span style={{ color: '#2d8f2d' }}>Mission</span>
                </h2>
                <p className="text-lg text-[#555555] mb-4">
                  At HopeLoom, our mission is to weave hope into every aspect of mental wellness. 
                  We are committed to providing accessible, stigma-free mental health resources and 
                  professional support to individuals from all walks of life.
                </p>
                <p className="text-lg text-[#555555] mb-4">
                  We understand that seeking help is a courageous first step, and we're here to 
                  make that journey as comfortable and supportive as possible. Through our comprehensive 
                  screening tools, expert professionals, and educational resources, we aim to empower 
                  individuals to take control of their mental health.
                </p>
                <p className="text-lg text-[#555555]">
                  Mental health is not a destination—it's a journey. And we're honored to walk 
                  alongside you every step of the way.
                </p>
              </div>
              <div className="flex-1">
                <img
                  src="https://placehold.co/600x400/a6d7a6/ffffff?text=Our+Mission"
                  alt="Our Mission"
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section
          ref={visionRef}
          className={`mb-16 transition-all duration-1000 ${
            visionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-white rounded-lg p-12 shadow-lg">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-6 text-[#222222]">
                  Our <span style={{ color: '#2d8f2d' }}>Vision</span>
                </h2>
                <p className="text-lg text-[#555555] mb-4">
                  We envision a world where mental health care is as normalized and accessible as 
                  physical health care. A world where seeking support is celebrated, not stigmatized. 
                  A world where everyone has the tools and resources they need to thrive emotionally 
                  and psychologically.
                </p>
                <p className="text-lg text-[#555555] mb-4">
                  Through innovation, education, and compassionate care, HopeLoom strives to be a 
                  beacon of hope for those navigating the complexities of mental wellness. We believe 
                  in the power of early intervention, preventive care, and ongoing support.
                </p>
                <p className="text-lg text-[#555555]">
                  Together, we can build a future where mental wellness is not just achievable—it's 
                  sustainable, supported, and celebrated.
                </p>
              </div>
              <div className="flex-1">
                <img
                  src="https://placehold.co/600x400/2d8f2d/ffffff?text=Our+Vision"
                  alt="Our Vision"
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mt-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#222222]">
            Our Core <span style={{ color: '#2d8f2d' }}>Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Heart className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">Compassion</h3>
              <p className="text-[#555555]">
                We approach every individual with empathy and understanding.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Users className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">Accessibility</h3>
              <p className="text-[#555555]">
                Mental health support should be available to everyone, everywhere.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Target className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">Excellence</h3>
              <p className="text-[#555555]">
                We maintain the highest standards in professional care and service.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Star className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">Hope</h3>
              <p className="text-[#555555]">
                We believe in the possibility of healing and growth for everyone.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ==================== OUR PROFESSIONALS PAGE ====================
const ProfessionalsPage = () => {
  const [professionalsRef, professionalsVisible] = useScrollAnimation();

  return (
    <div className="bg-[#f8fcf8] min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#222222]">
            Meet Our <span style={{ color: '#2d8f2d' }}>Professionals</span>
          </h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            Our team of licensed and experienced mental health professionals is here to support you 
            with expertise, compassion, and personalized care.
          </p>
        </div>

        {/* Professionals Grid */}
        <section
          ref={professionalsRef}
          className={`transition-all duration-1000 ${
            professionalsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROFESSIONALS_DATA.map((professional) => (
              <div
                key={professional.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Profile Image */}
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-full h-64 object-cover"
                />
                
                {/* Profile Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-[#222222]">
                    {professional.name}
                  </h3>
                  <p className="text-[#2d8f2d] font-semibold mb-3">
                    {professional.title}
                  </p>
                  <p className="text-[#555555] text-sm mb-4">
                    {professional.bio}
                  </p>
                  
                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {professional.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="bg-[#a6d7a6] text-[#222222] px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mt-20 bg-white rounded-lg p-12 shadow-lg">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#222222]">
            Why Choose <span style={{ color: '#2d8f2d' }}>Our Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-3 text-[#222222]">Licensed & Certified</h3>
              <p className="text-[#555555]">
                All our professionals are fully licensed and hold advanced certifications in their specialties.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-3 text-[#222222]">Years of Experience</h3>
              <p className="text-[#555555]">
                Our team brings decades of combined experience in treating a wide range of mental health conditions.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Heart className="w-14 h-14 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#222222]">Personalized Care</h3>
              <p className="text-[#555555]">
                We believe in tailored treatment plans that address your unique needs and goals.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ==================== RESOURCES PAGE ====================
const ResourcesPage = () => {
  const [blogRef, blogVisible] = useScrollAnimation();
  const [hotlinesRef, hotlinesVisible] = useScrollAnimation();
  const [exercisesRef, exercisesVisible] = useScrollAnimation();

  // News API State
  const [healthNews, setHealthNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Box Breathing Animation State
  const [breathPhase, setBreathPhase] = useState(0);
  const breathPhases = ['Breathe In (4s)', 'Hold (4s)', 'Breathe Out (4s)', 'Hold (4s)'];

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Mental Health News
  useEffect(() => {
    const fetchHealthNews = async () => {
      try {
        // Use CORS proxy for production
        const apiUrl = 'https://newsapi.org/v2/everything?q=mental+health+OR+depression+OR+anxiety+OR+therapy+OR+wellbeing&language=en&sortBy=publishedAt&apiKey=e4d976327f21462fb152474b0a88d683';
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();
        
        if (data.status === 'ok' && data.articles) {
          setHealthNews(data.articles.slice(0, 6)); // Get top 6 articles
        } else {
          // Fallback to static mental health articles if API fails
          setHealthNews([
            {
              title: "Understanding Mental Health: A Comprehensive Guide",
              description: "Learn about the importance of mental health and how to maintain emotional wellbeing in today's fast-paced world.",
              url: "https://www.mentalhealth.gov/basics/what-is-mental-health",
              urlToImage: null,
              publishedAt: new Date().toISOString(),
              source: { name: "Mental Health Resources" }
            },
            {
              title: "Coping with Anxiety: Effective Strategies",
              description: "Discover evidence-based techniques to manage anxiety and reduce stress in your daily life.",
              url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
              urlToImage: null,
              publishedAt: new Date().toISOString(),
              source: { name: "NIMH" }
            },
            {
              title: "Depression: Signs, Symptoms, and Support",
              description: "Understanding depression and finding the right help and treatment options available.",
              url: "https://www.nimh.nih.gov/health/topics/depression",
              urlToImage: null,
              publishedAt: new Date().toISOString(),
              source: { name: "NIMH" }
            },
            {
              title: "The Importance of Therapy in Mental Wellness",
              description: "How therapy can help improve mental health and provide tools for managing life's challenges.",
              url: "https://www.apa.org/topics/psychotherapy",
              urlToImage: null,
              publishedAt: new Date().toISOString(),
              source: { name: "APA" }
            },
            {
              title: "Building Resilience and Emotional Strength",
              description: "Learn strategies to build resilience and maintain mental wellbeing during difficult times.",
              url: "https://www.mentalhealth.gov/basics/mental-health-myths-facts",
              urlToImage: null,
              publishedAt: new Date().toISOString(),
              source: { name: "Mental Health Resources" }
            },
            {
              title: "Self-Care Practices for Mental Health",
              description: "Simple daily practices that can significantly improve your mental health and overall wellbeing.",
              url: "https://www.samhsa.gov/mental-health",
              urlToImage: null,
              publishedAt: new Date().toISOString(),
              source: { name: "SAMHSA" }
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching mental health news:', error);
        // Fallback to static mental health articles
        setHealthNews([
          {
            title: "Understanding Mental Health: A Comprehensive Guide",
            description: "Learn about the importance of mental health and how to maintain emotional wellbeing in today's fast-paced world.",
            url: "https://www.mentalhealth.gov/basics/what-is-mental-health",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { name: "Mental Health Resources" }
          },
          {
            title: "Coping with Anxiety: Effective Strategies",
            description: "Discover evidence-based techniques to manage anxiety and reduce stress in your daily life.",
            url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { name: "NIMH" }
          },
          {
            title: "Depression: Signs, Symptoms, and Support",
            description: "Understanding depression and finding the right help and treatment options available.",
            url: "https://www.nimh.nih.gov/health/topics/depression",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { name: "NIMH" }
          },
          {
            title: "The Importance of Therapy in Mental Wellness",
            description: "How therapy can help improve mental health and provide tools for managing life's challenges.",
            url: "https://www.apa.org/topics/psychotherapy",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { name: "APA" }
          },
          {
            title: "Building Resilience and Emotional Strength",
            description: "Learn strategies to build resilience and maintain mental wellbeing during difficult times.",
            url: "https://www.mentalhealth.gov/basics/mental-health-myths-facts",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { name: "Mental Health Resources" }
          },
          {
            title: "Self-Care Practices for Mental Health",
            description: "Simple daily practices that can significantly improve your mental health and overall wellbeing.",
            url: "https://www.samhsa.gov/mental-health",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: { name: "SAMHSA" }
          }
        ]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchHealthNews();
  }, []);

  return (
    <div className="bg-[#f8fcf8] min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#222222]">
            Wellness <span style={{ color: '#2d8f2d' }}>Resources</span>
          </h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            Explore the latest mental health news, emergency resources, and coping exercises 
            to support your mental health journey.
          </p>
        </div>

        {/* Mental Health News Section */}
        <section
          ref={blogRef}
          className={`mb-20 transition-all duration-1000 ${
            blogVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl font-bold mb-8 text-[#222222]">
            Mental Health <span style={{ color: '#2d8f2d' }}>News</span>
          </h2>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : newsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-800">{newsError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {healthNews.map((article, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Article Image */}
                  {article.urlToImage ? (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/2d8f2d/ffffff?text=Health+News';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[#2d8f2d] to-[#a6d7a6] flex items-center justify-center">
                      <Heart className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Article Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#a6d7a6] text-[#222222] px-3 py-1 rounded-full text-xs font-semibold">
                        {article.source.name}
                      </span>
                      <span className="text-[#555555] text-sm">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#222222] line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[#555555] mb-4 line-clamp-3">
                      {article.description || 'Read more about this health news story...'}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2d8f2d] hover:text-[#247124] font-semibold transition-all duration-300 inline-flex items-center gap-1"
                    >
                      Read Full Article <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Emergency Hotlines Section */}
        <section
          ref={hotlinesRef}
          className={`mb-20 transition-all duration-1000 ${
            hotlinesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-r from-[#2d8f2d] to-[#247124] rounded-lg p-12 shadow-lg text-white">
            <h2 className="text-4xl font-bold mb-8 text-center">
              Emergency <span className="text-[#a6d7a6]">Hotlines</span>
            </h2>
            <p className="text-center text-lg mb-8 opacity-90">
              If you or someone you know is in crisis, please reach out immediately. Help is available 24/7.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">National Suicide Prevention</h3>
                <p className="text-2xl font-bold mb-2">988</p>
                <p className="text-sm opacity-80">24/7 Crisis Support</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <MessageCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">Crisis Text Line</h3>
                <p className="text-2xl font-bold mb-2">Text "HELLO" to 741741</p>
                <p className="text-sm opacity-80">Free, 24/7 Support</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Phone className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold mb-2">SAMHSA Helpline</h3>
                <p className="text-2xl font-bold mb-2">1-800-662-4357</p>
                <p className="text-sm opacity-80">Mental Health & Substance Abuse</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coping Exercises Section */}
        <section
          ref={exercisesRef}
          className={`transition-all duration-1000 ${
            exercisesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl font-bold mb-8 text-[#222222]">
            Coping <span style={{ color: '#2d8f2d' }}>Exercises</span>
          </h2>
          <div className="bg-white rounded-lg p-12 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Box Breathing Animation */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Animated Box */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[#2d8f2d] to-[#a6d7a6] rounded-lg transition-all duration-[4000ms] ease-in-out"
                    style={{
                      transform: breathPhase === 0 ? 'scale(1.2)' : 
                                breathPhase === 1 ? 'scale(1.2)' : 
                                breathPhase === 2 ? 'scale(0.8)' : 
                                'scale(0.8)',
                      opacity: breathPhase === 0 || breathPhase === 2 ? 0.9 : 0.6
                    }}
                  ></div>
                  {/* Center Circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-lg">
                      <p className="text-[#2d8f2d] font-bold text-center text-sm px-2">
                        {breathPhases[breathPhase]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercise Instructions */}
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4 text-[#222222]">
                  Box Breathing Exercise
                </h3>
                <p className="text-[#555555] mb-6">
                  Box breathing is a powerful relaxation technique that can help reduce stress and 
                  improve focus. Follow the animation to practice this calming exercise.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <p className="font-semibold text-[#222222]">Breathe In</p>
                      <p className="text-[#555555] text-sm">Inhale slowly through your nose for 4 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <p className="font-semibold text-[#222222]">Hold</p>
                      <p className="text-[#555555] text-sm">Hold your breath for 4 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div>
                      <p className="font-semibold text-[#222222]">Breathe Out</p>
                      <p className="text-[#555555] text-sm">Exhale slowly through your mouth for 4 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">4️⃣</span>
                    <div>
                      <p className="font-semibold text-[#222222]">Hold</p>
                      <p className="text-[#555555] text-sm">Hold your breath for 4 seconds before repeating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ==================== CONTACT PAGE ====================
const ContactPage = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save contact submission to Firestore
      await addDoc(collection(db, 'contacts'), {
        userId: user?.uid || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'new',
        createdAt: serverTimestamp()
      });

      console.log('Contact form submitted to Firestore!');
      alert('Thank you for reaching out! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="bg-[#f8fcf8] min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#222222]">
            Get in <span style={{ color: '#2d8f2d' }}>Touch</span>
          </h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            Have questions or need support? We're here to help. Reach out to us and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-[#222222]">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-[#222222] font-semibold mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#222222] font-semibold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-[#222222] font-semibold mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[#222222] font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300 resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2d8f2d] hover:bg-[#247124] text-[#fefefe] py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-[#222222]">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-8 h-8 text-[#2d8f2d]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">Email</p>
                    <p className="text-[#555555]">support@hopeloom.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-8 h-8 text-[#2d8f2d]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">Phone</p>
                    <p className="text-[#555555]">1-800-HOPE-NOW</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-8 h-8 text-[#2d8f2d]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">Address</p>
                    <p className="text-[#555555]">123 Wellness Way<br />Hope City, HC 12345</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-[#2d8f2d]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">Office Hours</p>
                    <p className="text-[#555555]">Monday - Friday: 8am - 8pm<br />Saturday: 10am - 4pm</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Instagram className="w-8 h-8 text-[#2d8f2d]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">Follow Us</p>
                    <a 
                      href="https://www.instagram.com/hopeloomorg?igsh=MWdnYTU3dm1kYWZr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#555555] hover:text-[#E4405F] transition-colors duration-300 flex items-center gap-2"
                    >
                      <span>@hopeloomorg</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2d8f2d] to-[#247124] rounded-lg p-8 shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
              <p className="mb-4 opacity-90">
                If you're experiencing a mental health emergency, please call 988 for immediate support.
              </p>
              <button className="bg-white text-[#2d8f2d] hover:bg-[#f8fcf8] px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                Emergency Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== QUIZ DATA ====================
// Mock quiz questions for different screening types
const QUIZ_DATA = {
  anxiety: {
    title: "Anxiety Screener",
    description: "This assessment helps identify symptoms of anxiety. Answer honestly based on how you've felt over the past two weeks.",
    icon: "😰",
    questions: [
      {
        id: 1,
        text: "How often have you felt nervous, anxious, or on edge?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 2,
        text: "How often have you been unable to stop or control worrying?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 3,
        text: "How often have you been worrying too much about different things?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 4,
        text: "How often have you had trouble relaxing?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 5,
        text: "How often have you been so restless that it's hard to sit still?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 6,
        text: "How often have you become easily annoyed or irritable?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 7,
        text: "How often have you felt afraid as if something awful might happen?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      }
    ]
  },
  depression: {
    title: "Depression Screener",
    description: "This assessment helps identify symptoms of depression. Reflect on your experiences over the past two weeks.",
    icon: "😔",
    questions: [
      {
        id: 1,
        text: "How often have you had little interest or pleasure in doing things?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 2,
        text: "How often have you been feeling down, depressed, or hopeless?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 3,
        text: "How often have you had trouble falling or staying asleep, or sleeping too much?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 4,
        text: "How often have you been feeling tired or having little energy?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 5,
        text: "How often have you had poor appetite or been overeating?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      },
      {
        id: 6,
        text: "How often have you been feeling bad about yourself or that you are a failure?",
        options: [
          { text: "Not at all", value: 0 },
          { text: "Several days", value: 1 },
          { text: "More than half the days", value: 2 },
          { text: "Nearly every day", value: 3 }
        ]
      }
    ]
  },
  stress: {
    title: "Stress Level Check",
    description: "This assessment helps evaluate your current stress levels. Think about your recent experiences.",
    icon: "😫",
    questions: [
      {
        id: 1,
        text: "How often have you felt overwhelmed by your responsibilities?",
        options: [
          { text: "Rarely or never", value: 0 },
          { text: "Sometimes", value: 1 },
          { text: "Often", value: 2 },
          { text: "Very often", value: 3 }
        ]
      },
      {
        id: 2,
        text: "How often have you had difficulty concentrating due to stress?",
        options: [
          { text: "Rarely or never", value: 0 },
          { text: "Sometimes", value: 1 },
          { text: "Often", value: 2 },
          { text: "Very often", value: 3 }
        ]
      },
      {
        id: 3,
        text: "How often have you experienced physical symptoms like headaches or muscle tension?",
        options: [
          { text: "Rarely or never", value: 0 },
          { text: "Sometimes", value: 1 },
          { text: "Often", value: 2 },
          { text: "Very often", value: 3 }
        ]
      },
      {
        id: 4,
        text: "How often have you felt unable to cope with all the things you have to do?",
        options: [
          { text: "Rarely or never", value: 0 },
          { text: "Sometimes", value: 1 },
          { text: "Often", value: 2 },
          { text: "Very often", value: 3 }
        ]
      },
      {
        id: 5,
        text: "How often have you been angered by things outside of your control?",
        options: [
          { text: "Rarely or never", value: 0 },
          { text: "Sometimes", value: 1 },
          { text: "Often", value: 2 },
          { text: "Very often", value: 3 }
        ]
      }
    ]
  }
};

// ==================== SCREENING HUB PAGE ====================
const ScreeningHubPage = ({ setActiveQuiz, user, onLoginRequired }) => {
  const [hubRef, hubVisible] = useScrollAnimation();

  const screeningCards = [
    {
      id: 'anxiety',
      title: 'Anxiety Screener',
      description: 'Assess symptoms of anxiety and worry that may be affecting your daily life.',
      icon: Brain,
      color: 'from-[#2d8f2d] to-[#247124]'
    },
    {
      id: 'depression',
      title: 'Depression Screener',
      description: 'Evaluate symptoms of depression including mood, energy, and interest levels.',
      icon: Heart,
      color: 'from-[#247124] to-[#2d8f2d]'
    },
    {
      id: 'stress',
      title: 'Stress Level Check',
      description: 'Measure your current stress levels and identify potential stressors.',
      icon: AlertCircle,
      color: 'from-[#2d8f2d] to-[#a6d7a6]'
    }
  ];

  const handleStartAssessment = (cardId) => {
    if (user) {
      setActiveQuiz(cardId);
    } else {
      onLoginRequired();
    }
  };

  return (
    <div className="bg-[#f8fcf8] min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#222222]">
            Mental Health <span style={{ color: '#2d8f2d' }}>Screening Hub</span>
          </h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto mb-6">
            Take a confidential self-assessment to better understand your mental wellness. 
            These screening tools are designed by professionals to provide you with valuable insights.
          </p>
          <div className="bg-gradient-to-r from-[#a6d7a6] to-[#2d8f2d] text-white rounded-lg p-4 max-w-2xl mx-auto flex items-start gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">
              Important: These are screening tools, not medical diagnoses. 
              Results should be discussed with a qualified healthcare professional.
            </p>
          </div>
          
          {!user && (
            <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-w-2xl mx-auto flex items-start gap-3">
              <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 font-medium">
                Please sign in to take an assessment and save your results.
              </p>
            </div>
          )}
        </div>

        {/* Screening Cards */}
        <section
          ref={hubRef}
          className={`transition-all duration-1000 ${
            hubVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {screeningCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`bg-gradient-to-br ${card.color} p-8 text-center`}>
                    <div className="flex justify-center mb-4">
                      <IconComponent className="w-16 h-16 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-[#555555] mb-6 min-h-[80px]">
                      {card.description}
                    </p>
                    <button
                      onClick={() => handleStartAssessment(card.id)}
                      className="w-full bg-[#2d8f2d] hover:bg-[#247124] text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {user ? (
                        <>
                          <BarChart3 className="w-5 h-5" />
                          <span>Start Assessment</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Sign In to Start</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Information Section */}
        <section className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-[#222222] text-center">
            What to <span style={{ color: '#2d8f2d' }}>Expect</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <BarChart3 className="w-12 h-12 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">5-7 Questions</h3>
              <p className="text-[#555555]">
                Each assessment takes about 3-5 minutes to complete.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Lock className="w-12 h-12 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">Confidential</h3>
              <p className="text-[#555555]">
                Your responses are private and used only to generate your results.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Target className="w-12 h-12 text-[#2d8f2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#222222]">Actionable Insights</h3>
              <p className="text-[#555555]">
                Receive personalized results and recommendations for next steps.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ==================== QUIZ FLOW COMPONENT ====================
const QuizFlow = ({ quizType, setActiveQuiz, setQuizResult, user }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showProgress, setShowProgress] = useState(true);

  const quizData = QUIZ_DATA[quizType];
  const totalQuestions = quizData.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const calculateSeverity = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage < 25) return 'minimal';
    if (percentage < 50) return 'mild';
    if (percentage < 75) return 'moderate';
    return 'severe';
  };

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete - calculate score
      const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0);
      const maxScore = totalQuestions * 3;
      
      // Save assessment results to Firestore if user is logged in
      if (user) {
        try {
          await addDoc(collection(db, 'assessments'), {
            userId: user.uid,
            assessmentType: quizType,
            score: totalScore,
            maxScore: maxScore,
            severity: calculateSeverity(totalScore, maxScore),
            responses: responses,
            completedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Error saving assessment:', error);
        }
      }
      
      setQuizResult({
        type: quizType,
        score: totalScore,
        maxScore: maxScore,
        responses: responses
      });
      setActiveQuiz(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
      setActiveQuiz(null);
      setResponses({});
      setCurrentQuestion(0);
    }
  };

  const currentQuestionData = quizData.questions[currentQuestion];
  const isAnswered = responses[currentQuestionData.id] !== undefined;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d8f2d] to-[#247124] p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold">{quizData.title}</h2>
              <p className="text-sm opacity-90 mt-1">Question {currentQuestion + 1} of {totalQuestions}</p>
            </div>
            <button
              onClick={handleExit}
              className="text-white hover:text-red-200 text-3xl transition-all duration-300"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Question Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{quizData.icon}</div>
            <h3 className="text-2xl font-bold text-[#222222] mb-2">
              {currentQuestionData.text}
            </h3>
            <p className="text-[#555555]">
              Select the option that best describes your experience
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestionData.id, option.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 transform hover:scale-102 ${
                  responses[currentQuestionData.id] === option.value
                    ? 'border-[#2d8f2d] bg-[#a6d7a6]/20 shadow-md'
                    : 'border-gray-300 hover:border-[#a6d7a6] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#222222] font-semibold">{option.text}</span>
                  {responses[currentQuestionData.id] === option.value && (
                    <Check className="w-6 h-6 text-[#2d8f2d]" strokeWidth={3} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                currentQuestion === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#a6d7a6] text-[#222222] hover:bg-[#2d8f2d] hover:text-white'
              }`}
            >
              ← Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                !isAnswered
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2d8f2d] text-white hover:bg-[#247124] transform hover:scale-105'
              }`}
            >
              {currentQuestion === totalQuestions - 1 ? 'View Results' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== TEST RESULTS COMPONENT ====================
const TestResults = ({ result, setQuizResult, setCurrentPage }) => {
  if (!result) return null;

  // Calculate severity level
  const percentage = (result.score / result.maxScore) * 100;
  let severity, severityColor, message, recommendation;

  if (percentage <= 25) {
    severity = 'Low';
    severityColor = '#2d8f2d';
    message = 'Your responses suggest minimal symptoms in this area.';
    recommendation = 'Continue maintaining your mental wellness through healthy habits and self-care practices.';
  } else if (percentage <= 50) {
    severity = 'Mild';
    severityColor = '#a6d7a6';
    message = 'Your responses indicate mild symptoms that may benefit from attention.';
    recommendation = 'Consider incorporating stress-reduction techniques and monitoring your symptoms. If they persist, reach out to a professional.';
  } else if (percentage <= 75) {
    severity = 'Moderate';
    severityColor = '#f59e0b';
    message = 'Your responses suggest moderate symptoms that warrant professional attention.';
    recommendation = 'We strongly recommend scheduling an appointment with one of our mental health professionals for a comprehensive evaluation.';
  } else {
    severity = 'High';
    severityColor = '#dc2626';
    message = 'Your responses indicate significant symptoms that require professional support.';
    recommendation = 'Please schedule an appointment with a mental health professional as soon as possible. Your well-being matters.';
  }

  const handleBookAppointment = () => {
    setQuizResult(null);
    setCurrentPage('book');
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
  };

  const getQuizTitle = (type) => {
    return QUIZ_DATA[type]?.title || 'Assessment';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d8f2d] to-[#247124] p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <BarChart3 className="w-16 h-16" strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-bold mb-2">Your Results</h2>
          <p className="text-lg opacity-90">{getQuizTitle(result.type)}</p>
        </div>

        {/* Results Content */}
        <div className="p-8">
          {/* Score Visualization */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <p className="text-[#555555] mb-2">Your Score</p>
              <p className="text-5xl font-bold text-[#222222]">
                {result.score} <span className="text-2xl text-[#555555]">/ {result.maxScore}</span>
              </p>
            </div>

            {/* Severity Gauge */}
            <div className="relative mb-4">
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: severityColor
                  }}
                >
                  <span className="text-white font-bold">{Math.round(percentage)}%</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-[#555555] mt-2">
                <span>Low</span>
                <span>Mild</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>

            {/* Severity Badge */}
            <div className="text-center">
              <span
                className="inline-block px-6 py-2 rounded-full text-white font-bold text-xl"
                style={{ backgroundColor: severityColor }}
              >
                {severity} Level
              </span>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-[#f8fcf8] rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-[#222222]">What This Means</h3>
            <p className="text-[#555555] mb-4">{message}</p>
            <p className="text-[#222222] font-semibold">{recommendation}</p>
          </div>

          {/* Important Disclaimer */}
          <div className="bg-gradient-to-r from-[#f59e0b]/20 to-[#dc2626]/20 border-l-4 border-[#f59e0b] rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-[#f59e0b]" />
              </div>
              <div>
                <h4 className="font-bold text-[#222222] mb-2">Important Disclaimer</h4>
                <p className="text-[#555555] text-sm">
                  This is a screening tool, not a medical diagnosis. These results are based on your 
                  self-reported responses and should not replace a professional evaluation. Please 
                  consult with a qualified mental health professional for a formal assessment and 
                  personalized treatment recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleBookAppointment}
              className="flex-1 bg-[#2d8f2d] hover:bg-[#247124] text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Users className="w-6 h-6" />
              <span>Speak with a Professional</span>
            </button>
            <button
              onClick={handleRetakeQuiz}
              className="flex-1 bg-white border-2 border-[#2d8f2d] text-[#2d8f2d] hover:bg-[#f8fcf8] py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>Retake Assessment</span>
            </button>
          </div>

          {/* Emergency Resources */}
          {percentage > 75 && (
            <div className="mt-6 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white rounded-lg p-6">
              <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                <span>Need Immediate Support?</span>
              </h4>
              <p className="mb-4">
                If you're experiencing a crisis or having thoughts of self-harm, please reach out for help immediately:
              </p>
              <div className="space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>National Suicide Prevention Lifeline: 988</span>
                </p>
                <p className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Crisis Text Line: Text "HELLO" to 741741</span>
                </p>
                <p className="font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>Emergency Services: 911</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== BOOK APPOINTMENT PAGE ====================
const BookAppointmentPage = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    professionalId: '',
    reason: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save appointment to Firestore
      const selectedProf = PROFESSIONALS_DATA.find(
        (prof) => prof.id === parseInt(formData.professionalId)
      );

      await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        professionalId: formData.professionalId,
        professionalName: selectedProf?.name || 'Unknown',
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        reason: formData.reason,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      console.log('Appointment saved to Firestore!');
      setSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          professionalId: '',
          reason: ''
        });
      }, 5000);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const selectedProfessional = PROFESSIONALS_DATA.find(
    (prof) => prof.id === parseInt(formData.professionalId)
  );

  if (!user) {
    return (
      <div className="bg-[#f8fcf8] min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-12 shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <Lock className="w-20 h-20 text-[#2d8f2d]" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-[#222222]">
              Sign In <span style={{ color: '#2d8f2d' }}>Required</span>
            </h2>
            <p className="text-xl text-[#555555] mb-6">
              Please sign in or create an account to book an appointment with our professionals.
            </p>
            <div className="bg-[#f8fcf8] rounded-lg p-6">
              <div className="flex items-start gap-3 text-left">
                <Shield className="w-6 h-6 text-[#2d8f2d] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-[#222222] font-semibold mb-1">Why do I need to sign in?</p>
                  <p className="text-[#555555] text-sm">
                    Creating an account helps us securely manage your appointment details, 
                    send you reminders, and maintain your consultation history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fcf8] min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#222222]">
            Book Your <span style={{ color: '#2d8f2d' }}>Appointment</span>
          </h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            Take the next step in your mental wellness journey. Schedule a session with one of our 
            caring professionals at a time that works for you.
          </p>
        </div>

        {submitted ? (
          /* Success Message */
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-12 shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-[#222222]">
              Appointment <span style={{ color: '#2d8f2d' }}>Requested!</span>
            </h2>
            <p className="text-xl text-[#555555] mb-6">
              Thank you for taking this important step. We've received your appointment request.
            </p>
            <div className="bg-[#f8fcf8] rounded-lg p-6 mb-6">
              <p className="text-[#222222] font-semibold mb-2">What happens next?</p>
              <p className="text-[#555555] text-sm">
                Our team will review your request and contact you within 24 hours to confirm your 
                appointment details and answer any questions you may have.
              </p>
            </div>
            <p className="text-[#555555]">
              A confirmation email has been sent to <strong>{formData.email}</strong>
            </p>
          </div>
        ) : (
          /* Booking Form */
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-3xl font-bold mb-6 text-[#222222]">Appointment Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-[#222222] font-semibold mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[#222222] font-semibold mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[#222222] font-semibold mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Select Professional */}
                  <div>
                    <label htmlFor="professionalId" className="block text-[#222222] font-semibold mb-2">
                      Select a Professional *
                    </label>
                    <select
                      id="professionalId"
                      name="professionalId"
                      value={formData.professionalId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300 bg-white"
                    >
                      <option value="">-- Choose a professional --</option>
                      {PROFESSIONALS_DATA.map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {professional.name} - {professional.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="preferredDate" className="block text-[#222222] font-semibold mb-2">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label htmlFor="preferredTime" className="block text-[#222222] font-semibold mb-2">
                        Preferred Time *
                      </label>
                      <select
                        id="preferredTime"
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300 bg-white"
                      >
                        <option value="">-- Select time --</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <label htmlFor="reason" className="block text-[#222222] font-semibold mb-2">
                      Reason for Visit (Optional)
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300 resize-none"
                      placeholder="Briefly describe what you'd like to discuss..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#2d8f2d] hover:bg-[#247124] text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Request Appointment
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Selected Professional Card */}
                {selectedProfessional && (
                  <div className="bg-white rounded-lg p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-[#222222]">Selected Professional</h3>
                    <img
                      src={selectedProfessional.image}
                      alt={selectedProfessional.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h4 className="text-lg font-bold text-[#222222]">{selectedProfessional.name}</h4>
                    <p className="text-[#2d8f2d] font-semibold mb-2">{selectedProfessional.title}</p>
                    <p className="text-[#555555] text-sm mb-3">{selectedProfessional.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfessional.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-[#a6d7a6] text-[#222222] px-2 py-1 rounded-full text-xs font-semibold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Information Card */}
                <div className="bg-gradient-to-br from-[#2d8f2d] to-[#247124] text-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">What to Know</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                      <span>First session is typically 60 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                      <span>We accept most major insurance plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                      <span>Virtual and in-person sessions available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                      <span>Cancel or reschedule up to 24 hours in advance</span>
                    </li>
                  </ul>
                </div>

                {/* Emergency Notice */}
                <div className="bg-[#dc2626]/10 border-2 border-[#dc2626] rounded-lg p-4">
                  <p className="text-sm text-[#222222] font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#dc2626]" />
                    <span>In case of emergency</span>
                  </p>
                  <p className="text-xs text-[#555555]">
                    If you're experiencing a crisis, please call 988 or go to your nearest emergency room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== CHATBOT COMPONENT ====================
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your HopeLoom assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = { id: messages.length + 1, text: inputText, sender: 'user' };
    setMessages([...messages, userMessage]);

    // Mock bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: "Thank you for your message. Our chatbot functionality is currently in development. For immediate assistance, please contact us directly.",
        sender: 'bot'
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInputText('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#2d8f2d] hover:bg-[#247124] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-300 transform hover:scale-110 z-50"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d8f2d] to-[#247124] text-white p-4">
            <h3 className="text-lg font-bold">HopeLoom Assistant</h3>
            <p className="text-sm opacity-90">We're here to help</p>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-[#f8fcf8]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-[#2d8f2d] text-white'
                      : 'bg-white text-[#222222] shadow-md'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#a6d7a6]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
              />
              <button
                type="submit"
                className="bg-[#2d8f2d] hover:bg-[#247124] text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

// ==================== LOGIN/SIGNUP MODAL ====================
const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        // Step 1: Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Get user profile from Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('Welcome back,', userData.name);
          
          // Update last login timestamp
          await setDoc(docRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        } else {
          console.log('No profile data found for this user.');
        }

        onLoginSuccess();
      } else {
        // --- SIGNUP FLOW ---
        // Validation
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password should be at least 6 characters');
          setLoading(false);
          return;
        }

        // Step 1: Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          email: email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user'
        });

        console.log('User account created and profile saved!');
        onLoginSuccess();
      }
    } catch (err) {
      // Better error messages
      let errorMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Reset form when switching between login/signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create new user profile if it doesn't exist
        await setDoc(docRef, {
          name: user.displayName || 'Google User',
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user',
          photoURL: user.photoURL || null
        });
      } else {
        // Update last login timestamp
        await setDoc(docRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }

      console.log('Google Sign-In successful!');
      onLoginSuccess();
    } catch (err) {
      console.error('Google Sign-In error:', err);
      let errorMessage = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another popup is already open.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google Sign-In. Please add your domain in Firebase Console under Authentication > Settings > Authorized domains.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555555] hover:text-[#222222] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-[#2d8f2d]" />
          </div>
          <h2 className="text-3xl font-bold text-[#222222] mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#555555]">
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#222222] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#222222] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#a6d7a6] rounded-lg focus:outline-none focus:border-[#2d8f2d] transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d8f2d] hover:bg-[#247124] text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#555555]">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-[#2d8f2d] text-[#222222] font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-[#2d8f2d] hover:text-[#247124] font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
function App() {
  // State for navigation
  const [currentPage, setCurrentPage] = useState('home');
  
  // State for quiz flow management
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Authentication state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Listen to auth state changes and load user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Load user profile from Firestore
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Handle protected actions
  const handleProtectedAction = (action) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false); // Close the modal
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Render the current page based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} user={user} onLoginRequired={() => setShowLoginModal(true)} />;
      case 'about':
        return <AboutPage />;
      case 'professionals':
        return <ProfessionalsPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'screening':
        return <ScreeningHubPage setActiveQuiz={setActiveQuiz} user={user} onLoginRequired={() => setShowLoginModal(true)} />;
      case 'book':
        return <BookAppointmentPage user={user} />;
      case 'contact':
        return <ContactPage user={user} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} onLoginRequired={() => setShowLoginModal(true)} />;
    }
  };

  return (
    <div className="font-sans bg-[#f8fcf8] min-h-screen">
      {/* Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user}
        userProfile={userProfile}
        onLogout={() => signOut(auth)}
        onLoginRequired={() => setShowLoginModal(true)}
      />

      {/* Main Content */}
      <main>{renderPage()}</main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Chatbot */}
      <Chatbot />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Quiz Flow Modal - Rendered when activeQuiz is set */}
      {activeQuiz && (
        <QuizFlow
          quizType={activeQuiz}
          setActiveQuiz={setActiveQuiz}
          setQuizResult={setQuizResult}
          user={user}
        />
      )}

      {/* Test Results Modal - Rendered when quizResult is set */}
      {quizResult && (
        <TestResults
          result={quizResult}
          setQuizResult={setQuizResult}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

export default App;
