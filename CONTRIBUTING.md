# Contributing to Basky

Thank you for your interest in contributing to Basky! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the technical guidelines

## 🚀 Getting Started

### Prerequisites

1. **Install Required Tools**

   - Node.js 18+ and npm
   - Java 21 (JDK)
   - PostgreSQL 16
   - Python 3.8+
   - Git
   - Your favorite IDE (VS Code, IntelliJ IDEA, etc.)

2. **Fork and Clone**

   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR_USERNAME/Basky.git
   cd Basky
   ```

3. **Set Up Development Environment**

   ```bash
   # Database setup
   .\setup-database.ps1

   # Install frontend dependencies
   npm install

   # Install Python dependencies
   cd utilities
   pip install -r requirements.txt
   cd ..
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

## 📝 Development Workflow

### Backend Development (Spring Boot)

1. **Navigate to backend directory**

   ```bash
   cd baskyapp
   ```

2. **Run the application**

   ```bash
   ./mvnw spring-boot:run
   ```

3. **Run tests**

   ```bash
   ./mvnw test
   ```

4. **Code style**

   - Use Java 21 features appropriately
   - Follow Spring Boot best practices
   - Use meaningful variable and method names
   - Add JavaDoc for public methods
   - Keep controllers thin, business logic in services

5. **Database changes**
   - Update entity classes in `com.nba.baskyapp.<entity>/`
   - Test with local PostgreSQL first
   - Document schema changes in commit message

### Frontend Development (Angular)

1. **Start development server**

   ```bash
   npm start
   ```

2. **Code style**

   - Use standalone components (Angular 18+)
   - Follow Angular style guide
   - Use TypeScript strict mode
   - Implement proper error handling
   - Use RxJS best practices (unsubscribe, async pipe)

3. **Component structure**

   ```typescript
   @Component({
     selector: 'app-your-component',
     standalone: true,
     imports: [CommonModule, ...],
     templateUrl: './your-component.component.html',
     styleUrl: './your-component.component.css'
   })
   ```

4. **Styling**
   - Use global_styles.css for global styles
   - Component-specific styles in component files
   - Maintain dark theme consistency
   - Use CSS variables for colors

### Python Development (Data Scrapers)

1. **Navigate to utilities**

   ```bash
   cd utilities
   ```

2. **Code style**

   - Follow PEP 8
   - Use type hints
   - Add docstrings for functions
   - Handle exceptions gracefully
   - Add logging for important operations

3. **Testing scrapers**
   ```bash
   python test_nba_scraper.py
   python test_integration.py
   ```

## 🧪 Testing

### Backend Tests

```bash
cd baskyapp
./mvnw test
```

### Manual API Testing

```bash
# Test player endpoint
curl http://localhost:8080/api/players

# Test recent games
curl http://localhost:8080/api/boxscores/player/1
```

### Frontend Testing

```bash
# Run Angular tests (when implemented)
npm test

# Manual testing
npm start
# Navigate to http://localhost:4200
```

## 📋 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(frontend): add player comparison feature

Implement side-by-side player statistics comparison.
Includes new comparison component and service methods.

Closes #123
```

```
fix(backend): resolve CORS configuration conflict

Fixed issue where allowCredentials conflicted with
allowedOrigins wildcard. Now uses explicit origins.

Fixes #456
```

```
docs(deployment): update Azure deployment guide

Added troubleshooting section and cost optimization tips.
```

## 🔍 Pull Request Process

1. **Update your branch**

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all tests**

   ```bash
   # Backend
   cd baskyapp && ./mvnw test

   # Frontend (if tests exist)
   npm test
   ```

3. **Push your changes**

   ```bash
   git push origin your-branch
   ```

4. **Create Pull Request**

   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers

5. **PR Requirements**
   - ✅ All tests pass
   - ✅ Code follows style guidelines
   - ✅ Documentation updated (if needed)
   - ✅ No merge conflicts
   - ✅ Descriptive commit messages

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Verify it's reproducible
3. Test with latest code
4. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Backend version: [e.g. 3.5.6]
- Database: [e.g. PostgreSQL 16]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Screenshots, mockups, examples, etc.
```

## 📦 Areas to Contribute

### High Priority

- [ ] Unit tests for backend services
- [ ] Integration tests for API endpoints
- [ ] Frontend unit tests
- [ ] Performance optimization
- [ ] Accessibility improvements

### Feature Ideas

- [ ] Player comparison tool
- [ ] Season progression graphs
- [ ] Advanced stat filters
- [ ] Team vs team comparison
- [ ] Export data to CSV/Excel
- [ ] User favorites/bookmarks
- [ ] Mobile app
- [ ] Real-time game updates

### Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Code comments
- [ ] Tutorial videos
- [ ] Troubleshooting guides
- [ ] Architecture diagrams

### Infrastructure

- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Database optimization

## 🏗️ Architecture Guidelines

### Backend Structure

```
baskyapp/
└── src/main/java/com/nba/baskyapp/
    ├── player/
    │   ├── Player.java              # Entity
    │   ├── PlayerRepository.java    # Data access
    │   ├── PlayerService.java       # Business logic
    │   └── PlayerController.java    # REST endpoints
    ├── team/
    ├── game/
    ├── boxscore/
    └── config/
        └── CorsConfig.java          # Global configuration
```

### Frontend Structure

```
src/
├── components/
│   └── feature-name.component.ts    # Feature components
├── services/
│   └── feature-data.service.ts      # Data services
├── interfaces/
│   └── feature.interface.ts         # TypeScript interfaces
└── global_styles.css                # Global styles
```

### Database Design

- Use proper foreign keys
- Add indexes for frequently queried columns
- Normalize data appropriately
- Use meaningful column names
- Document schema changes

## 🔐 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Email security concerns to: [your-security-email]

### Security Guidelines

- Never commit credentials
- Use environment variables
- Validate all user input
- Use parameterized queries
- Keep dependencies updated
- Follow OWASP guidelines

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bug Reports**: Create an Issue
- **Feature Requests**: Create an Issue
- **Chat**: [Discord/Slack link if available]

## ✅ Checklist Before Submitting PR

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

## 📚 Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Angular Documentation](https://angular.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [nba_api Documentation](https://github.com/swar/nba_api)
- [Docker Documentation](https://docs.docker.com/)
- [Azure Documentation](https://docs.microsoft.com/azure/)

## 🎉 Recognition

Contributors will be:

- Listed in README.md
- Mentioned in release notes
- Appreciated in project discussions

Thank you for contributing to Basky! 🏀
