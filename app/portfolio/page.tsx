import Link from 'next/link'

export default function PortfolioPage() {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution built with Next.js, Stripe integration, and PostgreSQL. Features include user authentication, product management, shopping cart, and order processing.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Tailwind CSS"],
      icon: "🛒",
      liveUrl: "https://ecommerce-demo.example.com",
      githubUrl: "https://github.com/johndoe/ecommerce-platform"
    },
    {
      id: 2,
      title: "Task Management App",
      description: "Collaborative project management tool with real-time updates, drag-and-drop functionality, and team collaboration features. Built with React and Socket.io.",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Redux"],
      icon: "📋",
      liveUrl: "https://taskmanager-demo.example.com",
      githubUrl: "https://github.com/johndoe/task-manager"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      description: "Real-time weather application with location-based forecasts, interactive maps, and weather alerts. Integrates multiple weather APIs for accurate predictions.",
      technologies: ["React", "OpenWeatherMap API", "Chart.js", "Geolocation API"],
      icon: "🌤️",
      liveUrl: "https://weather-app-demo.example.com",
      githubUrl: "https://github.com/johndoe/weather-dashboard"
    },
    {
      id: 4,
      title: "Social Media Analytics",
      description: "Analytics dashboard for social media metrics with data visualization, trend analysis, and automated reporting. Connects to multiple social platforms.",
      technologies: ["Vue.js", "D3.js", "Python", "Flask", "MySQL"],
      icon: "📊",
      liveUrl: "https://analytics-demo.example.com",
      githubUrl: "https://github.com/johndoe/social-analytics"
    },
    {
      id: 5,
      title: "Recipe Finder App",
      description: "Mobile-first recipe discovery app with ingredient-based search, nutritional information, meal planning, and shopping list generation features.",
      technologies: ["React Native", "Firebase", "Spoonacular API", "Redux Toolkit"],
      icon: "🍳",
      liveUrl: "https://recipes-demo.example.com",
      githubUrl: "https://github.com/johndoe/recipe-finder"
    },
    {
      id: 6,
      title: "Blockchain Voting System",
      description: "Secure voting platform built on Ethereum blockchain ensuring transparency and immutability. Features smart contracts and decentralized architecture.",
      technologies: ["Solidity", "Web3.js", "React", "Ethereum", "IPFS"],
      icon: "🗳️",
      liveUrl: "https://voting-demo.example.com",
      githubUrl: "https://github.com/johndoe/blockchain-voting"
    }
  ]

  return (
    <div className="page-container">
      <Link href="/" className="back-button">
        ← Back to Home
      </Link>

      <div className="card">
        <h1>My Portfolio</h1>
        <p>
          Here's a collection of projects I've worked on, showcasing my skills in 
          full-stack development, mobile apps, and emerging technologies. Each project 
          represents different challenges and learning experiences.
        </p>
      </div>

      <div className="portfolio-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-image">
              {project.icon}
            </div>
            <div className="project-content">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index}
                      style={{
                        background: '#f0f0f0',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="project-links">
                <a 
                  href={project.liveUrl} 
                  className="project-link primary" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Live Demo
                </a>
                <a 
                  href={project.githubUrl} 
                  className="project-link secondary" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h2>Want to see more?</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Check out my GitHub profile for more projects and contributions to open source.
        </p>
        <a 
          href="https://github.com/johndoe" 
          className="link-button" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ display: 'inline-block', margin: '0' }}
        >
          🐱 Visit My GitHub
        </a>
      </div>
    </div>
  )
}