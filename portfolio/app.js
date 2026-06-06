/**
 * Portfolio Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleBackground();
  initNavbar();
  initPortfolio();
  initScrollReveal();
  initContactForm();
});

/* =========================================================================
   1. DYNAMIC PARTICLE BACKGROUND (HTML5 CANVAS)
   ========================================================================= */
function initParticleBackground() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  
  // Mouse interaction state
  let mouse = {
    x: null,
    y: null,
    radius: 120 // Interaction distance
  };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle window resizing
  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  setCanvasSize();
  window.addEventListener('resize', () => {
    setCanvasSize();
    initParticles();
  });

  // Particle representation
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
      this.baseOpacity = Math.random() * 0.4 + 0.15;
      this.opacity = this.baseOpacity;
    }

    // Draw particle
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color.replace('opacity', this.opacity);
      ctx.fill();
    }

    // Update position and interact
    update() {
      // Bounds check and collision redirection
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Mouse proximity interaction (subtle attraction)
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          // Attract towards mouse
          const force = (mouse.radius - distance) / mouse.radius;
          this.x += (dx / distance) * force * 1.5;
          this.y += (dy / distance) * force * 1.5;
          this.opacity = Math.min(0.8, this.baseOpacity + force * 0.5);
        } else {
          this.opacity = this.baseOpacity;
        }
      } else {
        this.opacity = this.baseOpacity;
      }

      // Move particle
      this.x += this.directionX;
      this.y += this.directionY;
      
      this.draw();
    }
  }

  // Populate particles
  function initParticles() {
    particlesArray = [];
    // Number of particles depends on viewport size
    let numberOfParticles = Math.floor((canvas.width * canvas.height) / 14000);
    numberOfParticles = Math.min(numberOfParticles, 120); // Cap it for performance

    // Cyan and Purple variants matching root palette
    const colors = [
      'rgba(0, 240, 255, opacity)', // Teal/cyan
      'rgba(168, 85, 247, opacity)'  // Purple
    ];

    for (let i = 0; i < numberOfParticles; i++) {
      let size = Math.random() * 2.5 + 1;
      let x = Math.random() * (window.innerWidth - size * 2) + size;
      let y = Math.random() * (window.innerHeight - size * 2) + size;
      let directionX = (Math.random() * 0.4) - 0.2;
      let directionY = (Math.random() * 0.4) - 0.2;
      let color = colors[Math.floor(Math.random() * colors.length)];

      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Draw connecting webs
  function connect() {
    let maxDistance = 120;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          let alpha = (1 - (distance / maxDistance)) * 0.15;
          // Determine gradient/blend of web line
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connect();
    requestAnimationFrame(animate);
  }

  initParticles();
  animate();
}

/* =========================================================================
   2. NAVBAR SCROLL EFFECTS & MOBILE MENU TOGGLE
   ========================================================================= */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  // Shrink/blur navbar on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger Toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when hitting link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

/* =========================================================================
   3. PORTFOLIO GRID FILTERING & DETAILS MODAL
   ========================================================================= */
// Structured Projects Dataset
const projectsData = [
  {
    id: 1,
    title: 'Student Attendance System',
    category: 'frontend',
    image: 'project_attendance.png',
    desc: 'A web-based attendance management system featuring separate login roles for Admin, Teacher, and Student users.',
    fullDesc: [
      'Developed a Student Attendance System using HTML, CSS, Bootstrap, and JavaScript.',
      'Created separate login roles for Admin, Teacher, and Student users.',
      'Implemented attendance marking and attendance report features.',
      'Designed a simple, responsive, and user-friendly dashboard interface.'
    ],
    tech: ['HTML5', 'CSS3', 'Bootstrap', 'JavaScript', 'DOM Manipulation', 'Responsive Design'],
    duration: 'Jan 2025 - Mar 2025',
    role: 'Developer',
    links: {
      demo: 'https://naravulaprudhvi.github.io/student_attendance_system/admin.html',
      github: 'https://github.com/naravulaprudhvi'
    }
  },
  {
    id: 2,
    title: 'Organic Farming Awareness Campaign',
    category: 'creative',
    image: 'project_farming.png',
    desc: 'A community-focused outreach campaign promoting sustainable agriculture, organic composting, and chemical-free soil health.',
    fullDesc: [
      'Community Service Project focused on sustainable agriculture.',
      'Created awareness materials and studied organic farming practices.',
      'Interacted with local groups to promote composting, soil health, natural fertilizers, and water-saving.'
    ],
    tech: ['Community Service', 'Sustainable Agriculture', 'Public Awareness', 'Content Design'],
    duration: 'Campaign Project',
    role: 'Campaign Lead',
    links: {
      demo: '#',
      github: '#'
    }
  }
];

function initPortfolio() {
  const grid = document.querySelector('.portfolio-grid');
  const modal = document.getElementById('project-modal');
  const modalClose = document.querySelector('.modal-close');
  
  if (!grid) return;

  // 1. Render Project Cards Dynamically
  function renderProjects() {
    grid.innerHTML = '';
    
    projectsData.forEach(project => {
      const card = document.createElement('div');
      card.className = 'glass-card project-card reveal revealed';
      card.dataset.id = project.id;
      
      card.innerHTML = `
        <div class="project-img-wrapper">
          <img src="assets/${project.image}" alt="${project.title}" class="project-img" onerror="this.src='https://picsum.photos/600/400?random=${project.id}'">
          <div class="project-overlay">
            <span>View Details <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
        <div class="project-info">
          <span class="project-category">${project.category.replace('-', ' ')}</span>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.desc}</p>
          <div class="project-tags">
            ${project.tech.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}
            ${project.tech.length > 3 ? `<span class="tag">+${project.tech.length - 3}</span>` : ''}
          </div>
        </div>
      `;
      
      // Card click opens details modal
      card.addEventListener('click', () => openModal(project));
      grid.appendChild(card);
    });
  }

  // 2. Modal Actions
  function openModal(project) {
    if (!modal) return;
    
    // Populate Modal Content
    const modalImg = modal.querySelector('.modal-img');
    const modalTitle = modal.querySelector('.modal-title');
    const modalCat = modal.querySelector('.modal-category');
    const modalRole = document.getElementById('modal-role');
    const modalDuration = document.getElementById('modal-duration');
    const modalDesc = modal.querySelector('.modal-desc');
    const modalTech = modal.querySelector('.modal-tech-list');
    const modalDemo = document.getElementById('modal-demo-link');
    const modalGithub = document.getElementById('modal-github-link');
    
    if (modalImg) {
      modalImg.src = `assets/${project.image}`;
      modalImg.onerror = function() {
        this.src = `https://picsum.photos/800/500?random=${project.id}`;
      };
      modalImg.alt = project.title;
    }
    
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalCat) modalCat.textContent = project.category.replace('-', ' ');
    if (modalRole) modalRole.textContent = project.role;
    if (modalDuration) modalDuration.textContent = project.duration;
    if (modalDesc) {
      if (Array.isArray(project.fullDesc)) {
        modalDesc.innerHTML = `<ul style="list-style-type: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 0;">
          ${project.fullDesc.map(point => `<li>${point}</li>`).join('')}
        </ul>`;
      } else {
        modalDesc.textContent = project.fullDesc;
      }
    }
    
    // Load tools/skills list
    if (modalTech) {
      modalTech.innerHTML = project.tech.map(t => `<span class="tag">${t}</span>`).join('');
    }
    
    // Configure buttons
    if (modalDemo) {
      if (!project.links.demo || project.links.demo === '#') {
        modalDemo.style.display = 'none';
      } else {
        modalDemo.style.display = 'inline-flex';
        modalDemo.href = project.links.demo;
      }
    }
    if (modalGithub) {
      if (!project.links.github || project.links.github === '#') {
        modalGithub.style.display = 'none';
      } else {
        modalGithub.style.display = 'inline-flex';
        modalGithub.href = project.links.github;
      }
    }
    
    // Display Modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Stop background scroll
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable scroll
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal when clicking dark backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Close modal on Escape Key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Initial draw
  renderProjects();
}

/* =========================================================================
   4. INTERSECTION OBSERVER FOR SCROLL REVEAL & NAV LINKS ACTIVE STATE
   ========================================================================= */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  // Trigger element fade-ins as you scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Highlight current section in navbar menu
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* =========================================================================
   5. CONTACT FORM VALIDATION & INTERACTIVE HANDLER
   ========================================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    
    // Clear status
    formStatus.className = 'form-status';
    formStatus.innerHTML = '';
    
    // Core inputs validation
    if (!name || !email || !message) {
      showStatus('Please fill in all standard inputs.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showStatus('Please supply a valid email address.', 'error');
      return;
    }

    // Submit animation / processing state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Dispatching...';
    
    // Simulate API pipeline delay (1.5s)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      showStatus('<i class="fa-solid fa-circle-check"></i> Form dispatched successfully!', 'success');
      form.reset();
    }, 1500);
  });

  function showStatus(text, type) {
    formStatus.innerHTML = text;
    formStatus.classList.add(type);
    
    if (type === 'success') {
      setTimeout(() => {
        formStatus.classList.remove('success');
        formStatus.innerHTML = '';
      }, 5000);
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
