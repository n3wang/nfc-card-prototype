import Link from 'next/link'

export default function ResumePage() {
  return (
    <div className="page-container">
      <Link href="/" className="back-button">
        ← Back to Home
      </Link>

      <div className="card">
        <h1>John Doe</h1>
        <p style={{ fontSize: '1.2rem', color: '#667eea', fontWeight: '600' }}>
          Full Stack Developer | React & Node.js Specialist
        </p>
        <p>📍 San Francisco, CA | 📧 john@example.com | 📱 (555) 123-4567</p>
      </div>

      <div className="card">
        <h2>Professional Summary</h2>
        <p>
          Passionate Full Stack Developer with 5+ years of experience building scalable web applications 
          using modern technologies. Expertise in React, Node.js, and cloud platforms. Strong background 
          in translating business requirements into technical solutions and leading development teams.
        </p>
      </div>

      <div className="card">
        <h2>Technical Skills</h2>
        <div className="skills-grid">
          <div className="skill-tag">JavaScript</div>
          <div className="skill-tag">TypeScript</div>
          <div className="skill-tag">React</div>
          <div className="skill-tag">Next.js</div>
          <div className="skill-tag">Node.js</div>
          <div className="skill-tag">Express</div>
          <div className="skill-tag">PostgreSQL</div>
          <div className="skill-tag">MongoDB</div>
          <div className="skill-tag">AWS</div>
          <div className="skill-tag">Docker</div>
          <div className="skill-tag">Git</div>
          <div className="skill-tag">REST APIs</div>
        </div>
      </div>

      <div className="card">
        <h2>Professional Experience</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Senior Full Stack Developer</h3>
          <p style={{ color: '#667eea', fontWeight: '600' }}>TechCorp Inc. | 2021 - Present</p>
          <ul>
            <li>Led development of customer-facing web application serving 100k+ users</li>
            <li>Architected microservices infrastructure reducing response times by 40%</li>
            <li>Mentored junior developers and established code review best practices</li>
            <li>Implemented CI/CD pipelines improving deployment frequency by 300%</li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3>Full Stack Developer</h3>
          <p style={{ color: '#667eea', fontWeight: '600' }}>StartupXYZ | 2019 - 2021</p>
          <ul>
            <li>Built MVP from scratch using React and Node.js, reaching 10k users in 6 months</li>
            <li>Developed RESTful APIs and integrated third-party payment systems</li>
            <li>Optimized database queries improving application performance by 60%</li>
            <li>Collaborated with designers to implement responsive UI/UX designs</li>
          </ul>
        </div>

        <div>
          <h3>Junior Developer</h3>
          <p style={{ color: '#667eea', fontWeight: '600' }}>WebAgency Pro | 2018 - 2019</p>
          <ul>
            <li>Developed custom WordPress themes and plugins for client projects</li>
            <li>Created responsive websites using HTML, CSS, and JavaScript</li>
            <li>Worked with cross-functional teams to deliver projects on time</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2>Education</h2>
        <div>
          <h3>Bachelor of Science in Computer Science</h3>
          <p style={{ color: '#667eea', fontWeight: '600' }}>University of California, Berkeley | 2014 - 2018</p>
          <p>Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering</p>
        </div>
      </div>

      <div className="card">
        <h2>Certifications</h2>
        <ul>
          <li>AWS Certified Solutions Architect - Associate (2022)</li>
          <li>Google Cloud Professional Cloud Developer (2021)</li>
          <li>MongoDB Certified Developer Associate (2020)</li>
        </ul>
      </div>
    </div>
  )
}