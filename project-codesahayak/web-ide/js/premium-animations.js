/**
 * CodeSahayak Premium Animations
 * Dynamic animations, scroll effects, and emoji removal
 */

(function() {
    'use strict';

    // ========================================================================
    // REMOVE ALL EMOJIS
    // ========================================================================
    
    function removeEmojis() {
        // Emoji regex pattern
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]/gu;
        
        // Get all text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.nodeValue.match(emojiRegex)) {
                textNodes.push(node);
            }
        }
        
        // Replace emojis with appropriate icons or text
        textNodes.forEach(node => {
            const text = node.nodeValue;
            let newText = text;
            
            // Replace common emojis with Font Awesome icons or text
            const replacements = {
                '🤖': '<i class="fas fa-robot"></i>',
                '🚀': '<i class="fas fa-rocket"></i>',
                '💻': '<i class="fas fa-laptop-code"></i>',
                '📚': '<i class="fas fa-book"></i>',
                '🎯': '<i class="fas fa-bullseye"></i>',
                '✨': '<i class="fas fa-sparkles"></i>',
                '🌟': '<i class="fas fa-star"></i>',
                '⭐': '<i class="fas fa-star"></i>',
                '❤️': '<i class="fas fa-heart"></i>',
                '💡': '<i class="fas fa-lightbulb"></i>',
                '🔥': '<i class="fas fa-fire"></i>',
                '🎉': '<i class="fas fa-party-horn"></i>',
                '🏆': '<i class="fas fa-trophy"></i>',
                '📱': '<i class="fas fa-mobile-alt"></i>',
                '🌐': '<i class="fas fa-globe"></i>',
                '🇮🇳': '<span class="india-flag">IN</span>',
                '✅': '<i class="fas fa-check-circle"></i>',
                '❌': '<i class="fas fa-times-circle"></i>',
                '⚠️': '<i class="fas fa-exclamation-triangle"></i>',
                'ℹ️': '<i class="fas fa-info-circle"></i>'
            };
            
            // Check if parent can handle HTML
            if (node.parentElement && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                Object.keys(replacements).forEach(emoji => {
                    if (text.includes(emoji)) {
                        const span = document.createElement('span');
                        span.innerHTML = text.replace(new RegExp(emoji, 'g'), replacements[emoji]);
                        node.parentElement.replaceChild(span, node);
                    }
                });
            } else {
                // Just remove emojis if we can't replace with HTML
                newText = text.replace(emojiRegex, '');
                if (newText !== text) {
                    node.nodeValue = newText;
                }
            }
        });
    }

    // ========================================================================
    // SCROLL ANIMATIONS
    // ========================================================================
    
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all elements with animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Add animation classes to sections
        document.querySelectorAll('section').forEach((section, index) => {
            section.classList.add('animate-on-scroll');
            section.style.transitionDelay = `${index * 0.1}s`;
        });
        
        // Add animation to cards
        document.querySelectorAll('.card, .feature-card, .glass-card').forEach((card, index) => {
            card.classList.add('animate-on-scroll');
            card.style.transitionDelay = `${index * 0.05}s`;
        });
    }

    // ========================================================================
    // PARTICLE BACKGROUND
    // ========================================================================
    
    function createParticles() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-bg';
        hero.appendChild(particlesContainer);
        
        // Create 50 particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;
            particlesContainer.appendChild(particle);
        }
    }

    // ========================================================================
    // SMOOTH SCROLL
    // ========================================================================
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ========================================================================
    // PARALLAX EFFECT
    // ========================================================================
    
    function initParallax() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    
                    // Parallax for hero section
                    const hero = document.querySelector('.hero-section');
                    if (hero) {
                        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                    }
                    
                    // Parallax for particles
                    document.querySelectorAll('.particle').forEach((particle, index) => {
                        const speed = 0.1 + (index % 3) * 0.05;
                        particle.style.transform = `translateY(${scrolled * speed}px)`;
                    });
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }

    // ========================================================================
    // TYPING ANIMATION
    // ========================================================================
    
    function initTypingAnimation() {
        const elements = document.querySelectorAll('[data-typing]');
        
        elements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.opacity = '1';
            
            let index = 0;
            const speed = 50;
            
            function type() {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, speed);
                }
            }
            
            // Start typing when element is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        type();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(element);
        });
    }

    // ========================================================================
    // COUNTER ANIMATION
    // ========================================================================
    
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.textContent = Math.floor(current).toLocaleString();
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target.toLocaleString();
                            }
                        };
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    // ========================================================================
    // HOVER EFFECTS
    // ========================================================================
    
    function initHoverEffects() {
        // Add hover lift effect to cards
        document.querySelectorAll('.card, .feature-card').forEach(card => {
            card.classList.add('hover-lift');
        });
        
        // Add hover glow to buttons
        document.querySelectorAll('.btn, button').forEach(btn => {
            if (!btn.classList.contains('btn-premium')) {
                btn.classList.add('hover-glow');
            }
        });
    }

    // ========================================================================
    // GRADIENT ANIMATION
    // ========================================================================
    
    function animateGradients() {
        const gradientElements = document.querySelectorAll('[data-gradient-animate]');
        
        gradientElements.forEach(element => {
            element.style.backgroundSize = '200% 200%';
            element.style.animation = 'gradientShift 15s ease infinite';
        });
    }

    // ========================================================================
    // INITIALIZE ALL
    // ========================================================================
    
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        console.log('Initializing premium animations...');
        
        // Remove emojis first
        setTimeout(removeEmojis, 100);
        
        // Initialize animations
        initScrollAnimations();
        createParticles();
        initSmoothScroll();
        initParallax();
        initTypingAnimation();
        animateCounters();
        initHoverEffects();
        animateGradients();
        
        console.log('Premium animations initialized!');
    }
    
    // Start initialization
    init();
    
    // Re-run emoji removal after dynamic content loads
    const observer = new MutationObserver(() => {
        removeEmojis();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
